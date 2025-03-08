import socketio
import time

sio = socketio.Client()

sio.connect('http://21.64.2.99:5000')

# mockData = {
#     'data': {     
#         "Position": {
#             'X': 0.479,
#             'Y': 0.465,
#             'Z': 0.082,
#             'Quality Factor': 85
#         },
#     }
# }

# sio.emit('tag_data', mockData)
@sio.on('updateOperationMode')
def on_update_operation_mode(data):
    print(f"Nhận dữ liệu từ: {data}")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Disconnecting...")
    sio.disconnect()