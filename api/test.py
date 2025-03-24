import socketio
import time

sio = socketio.Client()

sio.connect('http://21.64.10.5:5000')

mockData = {
    'mac': 'E9:82:21:9E:C8:8F',
    'data': {     
        "Position": {
            'X': 3,
            'Y': 3,
            'Z': 1.95
        },  
    }
}

sio.emit('tag_data', mockData)
# @sio.on('updateOperationMode')
# def on_update_operation_mode(data):
#     print(f"Nhận dữ liệu từ: {data}")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Disconnecting...")
    sio.disconnect()