import socketio
import time

sio = socketio.Client()

sio.connect('http://21.64.13.29:5000')

mockData = {
    'mac': 'EB:52:53:F5:D5:90',
    'data': {     
        "Position": {
            'X': 1,
            'Y': 1,
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