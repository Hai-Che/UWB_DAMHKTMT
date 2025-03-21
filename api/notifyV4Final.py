import asyncio
import struct
import socketio
from bleak import BleakClient, BleakScanner, BleakError
from location import decode_location_data
from global_var import TAG_MAC, SERVER_URL, LOCATION_DATA_UUID, LOCATION_DATA_MODE_UUID, MAC_ADDRESS_ANCHOR_LIST, OPERATION_MODE_UUID

sio = socketio.AsyncClient()

anchors = []
tracking_enabled = False  # Biến để kiểm soát việc gửi dữ liệu từ Tag

async def safe_emit(event, data):
    if sio.connected:
        await sio.emit(event, data)
    else:
        print(f"Không thể gửi '{event}' vì không kết nối với server!")

def notification_handler(sender, data):
    decoded_data = decode_location_data(data)
    print(f"Nhận dữ liệu từ {sender}: {decoded_data}")
    
    if tracking_enabled:
        asyncio.create_task(safe_emit("tag_data", {"mac": str(sender), "data": decoded_data}))

async def connect_to_server():
    try:
        await sio.connect(SERVER_URL)
        print("Đã kết nối với server")
    except Exception as e:
        print(f"Lỗi kết nối server: {e}")

@sio.on("start_tracking")
async def start_tracking(data = None):
    global tracking_enabled
    tracking_enabled = True
    print("Tracking đã được bật!")

@sio.on("stop_tracking")
async def stop_tracking(data = None):
    global tracking_enabled
    tracking_enabled = False
    print("Tracking đã dừng!")

@sio.on("updateOperationMode")
async def update_operation_mode(data):
    mac_address = data.get("macAddress")
    operation_mode = data.get("operationMode")

    if not mac_address or not operation_mode:
        print("Dữ liệu updateOperationMode không hợp lệ!")
        return

    try:
        # Chuyển chuỗi nhị phân thành bytes
        if all(c in "01" for c in operation_mode):  # Kiểm tra nếu là chuỗi nhị phân
            operation_mode_bytes = int(operation_mode, 2).to_bytes(len(operation_mode) // 8, byteorder="big")
        else:  # Nếu là số thập phân dưới dạng chuỗi, chuyển sang int trước
            operation_mode_bytes = int(operation_mode).to_bytes(2, byteorder="big")

        print(f"Operation Mode (bytes): {operation_mode_bytes.hex()}")

        async with BleakClient(mac_address) as client:
            if not await client.is_connected():
                print(f"Không thể kết nối tới {mac_address}")
                return

            print(f"Đã kết nối tới {mac_address}, cập nhật operation mode...")

            await client.write_gatt_char(OPERATION_MODE_UUID, operation_mode_bytes)
            print(f"Đã cập nhật operation mode cho {mac_address}: {operation_mode}")

    except ValueError as e:
        print(f"Lỗi chuyển đổi operation_mode: {e}")
    except BleakError as e:
        print(f"Lỗi BLE với {mac_address}: {e}")
    except asyncio.TimeoutError:
        print(f"Timeout khi kết nối với {mac_address}")
    except Exception as e:
        print(f"Lỗi không xác định với {mac_address}: {e}")

async def process_device(address, is_tag=False, max_retries=3):
    client = BleakClient(address)
    for attempt in range(max_retries):
        try:
            if await client.is_connected():
                print(f"Đã kết nối với {address}, bỏ qua kết nối lại.")
            else:
                await client.connect()
            
            if not await client.is_connected():
                print(f"Không thể kết nối tới {address}, thử lại lần {attempt+1}")
                await asyncio.sleep(2)
                continue  # Thử lại nếu không kết nối được

            print(f"Đã kết nối tới {address}")

            loc_mode_data = await client.read_gatt_char(LOCATION_DATA_MODE_UUID)
            loc_mode = int(loc_mode_data[0])
            print(f"Location Data Mode ({address}): {loc_mode}")

            if is_tag:
                print(f"Chờ lệnh từ server để bắt đầu gửi dữ liệu từ tag {address}...")
                while True:
                    if tracking_enabled:
                        await client.start_notify(LOCATION_DATA_UUID, notification_handler)
                        print(f"Tag {address} đang gửi data...")
                        await asyncio.sleep(2)
                        await client.stop_notify(LOCATION_DATA_UUID)
                    else:
                        data = await client.read_gatt_char(LOCATION_DATA_UUID)
                        decoded_data = decode_location_data(data)
                        await safe_emit("tag_data", {"mac": address, "data": decoded_data})
                        await asyncio.sleep(5)
            else:
                data = await client.read_gatt_char(LOCATION_DATA_UUID)
                operation_mode_data = await client.read_gatt_char(OPERATION_MODE_UUID)
                decoded_data = decode_location_data(data)
                operation_mode_value = int.from_bytes(operation_mode_data[:2], byteorder="big")
                operation_mode_binary = f"{operation_mode_value:016b}"
                print(f"Operation Mode (Binary 16-bit): {operation_mode_binary}")
                print(f"Anchor {address} gửi dữ liệu: {decoded_data}")
                await safe_emit("anchor_data", {"mac": address, "data": decoded_data, "operation_mode_data": operation_mode_binary})
            break  # Thoát vòng lặp nếu kết nối thành công

        except BleakError as e:
            if "org.bluez.Error.InProgress" in str(e):
                print(f"Lỗi BLE với {address}: Operation already in progress, chờ 5 giây rồi thử lại...")
                await asyncio.sleep(2)  # Đợi rồi thử lại
                continue
            print(f"Lỗi BLE với {address}: {e}")
        except asyncio.TimeoutError:
            print(f"Timeout khi kết nối với {address}")
        except Exception as e:
            print(f"Lỗi không xác định với {address}: {e}")
        finally:
            if await client.is_connected():
                await client.disconnect()  # Đảm bảo đóng kết nối            
async def main():
    await connect_to_server()
    
    devices = await BleakScanner.discover()
    
    for device in devices:
        if device.address in MAC_ADDRESS_ANCHOR_LIST:
            anchors.append(device.address)
    
    print(f"Danh sách anchor: {anchors}")
    
    for anchor in anchors:
        await process_device(anchor, is_tag=False)
        # asyncio.create_task(process_device(anchor, is_tag=False))
    
    print("Chờ lệnh từ server để xử lý Tag...")
    # asyncio.create_task(process_device(TAG_MAC, is_tag=True))
    await process_device(TAG_MAC, is_tag=True)
    await sio.disconnect()

if __name__ == "__main__":
    try:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
    except RuntimeError as e:
        print(f"Lỗi runtime: {e}")
    finally:
        loop.close()
