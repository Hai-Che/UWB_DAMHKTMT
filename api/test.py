import socketio
import time

sio = socketio.Client()

sio.connect('http://10.229.18.91:5000')

mockData = {
    'mac': 'EB:52:53:F5:D5:90',
    'data': {     
        "Position": {
            'X': 15,
            'Y': 15,
            'Z': 1.95
        },  
    }
}

sio.emit('tag_data', mockData)
# @sio.on('set_anchor_location')
# def set_anchor_location(data):
#     print(f"Nhận dữ liệu từ: {data}")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Disconnecting...")
    sio.disconnect()