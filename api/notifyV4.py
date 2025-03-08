import asyncio
import struct
import socketio
from bleak import BleakClient, BleakScanner, BleakError
from location import decode_location_data
from global_var import (
    TAG_MAC, SERVER_URL, LOCATION_DATA_UUID, LOCATION_DATA_MODE_UUID,
    MAC_ADDRESS_ANCHOR_LIST, OPERATION_MODE_UUID
)

sio = socketio.AsyncClient()

anchors = []
tracking_enabled = False

def notification_handler(sender, data):
    decoded_data = decode_location_data(data)
    print(f"Nhận dữ liệu từ {sender}: {decoded_data}")
    
    if tracking_enabled:
        asyncio.create_task(sio.emit("tag_data", {"mac": str(sender), "data": decoded_data}))

async def safe_emit(event, data):
    if sio.connected:
        await sio.emit(event, data)
    else:
        print(f"Không thể gửi '{event}' vì không kết nối với server!")

async def connect_to_server():
    try:
        await sio.connect(SERVER_URL)
        print("Đã kết nối với server")
    except Exception as e:
        print(f"Lỗi kết nối server: {e}")

@sio.on("start_tracking")
async def start_tracking(data):
    global tracking_enabled
    tracking_enabled = True
    print("Tracking đã được bật!")

@sio.on("stop_tracking")
async def stop_tracking(data):
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
        async with BleakClient(mac_address) as client:
            if not await client.is_connected():
                print(f"Không thể kết nối tới {mac_address}")
                return
            
            print(f"Đã kết nối tới {mac_address}, cập nhật operation mode...")
            operation_mode_bytes = bytes.fromhex(operation_mode)
            await client.write_gatt_char(OPERATION_MODE_UUID, operation_mode_bytes)
            print(f"Đã cập nhật operation mode cho {mac_address}: {operation_mode}")
    except BleakError as e:
        print(f"Lỗi BLE với {mac_address}: {e}")
    except asyncio.TimeoutError:
        print(f"Timeout khi kết nối với {mac_address}")
    except Exception as e:
        print(f"Lỗi không xác định với {mac_address}: {e}")

async def process_device(address, is_tag=False):
    try:
        async with BleakClient(address) as client:
            if not await client.is_connected():
                print(f"Không thể kết nối tới {address}")
                return
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
                        await asyncio.sleep(1)
            else:
                # while True:
                data = await client.read_gatt_char(LOCATION_DATA_UUID)
                decoded_data = decode_location_data(data)
                print(f"Anchor {address} gửi dữ liệu: {decoded_data}")
                await safe_emit("anchor_data", {"mac": str(address), "data": decoded_data})
                    # await asyncio.sleep(2)  
    except BleakError as e:
        print(f"Lỗi BLE với {address}: {e}")
    except asyncio.TimeoutError:
        print(f"Timeout khi kết nối với {address}")
    except Exception as e:
        print(f"Lỗi không xác định với {address}: {e}")

async def main():
    await connect_to_server()
    
    devices = await BleakScanner.discover()
    
    for device in devices:
        if device.address in MAC_ADDRESS_ANCHOR_LIST:
            anchors.append(device.address)
    
    print(f"Danh sách anchor: {anchors}")
    
    for anchor in anchors:
        asyncio.create_task(process_device(anchor, is_tag=False))
    
    print("Chờ lệnh từ server để xử lý Tag...")
    await process_device(TAG_MAC, is_tag=True)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except RuntimeError:
        print("Lỗi: Event loop đã đóng hoặc không thể khởi chạy lại")
