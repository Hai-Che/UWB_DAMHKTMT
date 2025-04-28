import { useState, useEffect, useRef } from 'react';
import { MdLocationPin, MdUpload } from 'react-icons/md';
import './home.scss';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiRequest from '../../lib/apiRequest';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions';
import zIndex from '@mui/material/styles/zIndex';

const socket = io('http://localhost:5000');
const Home = () => {
  const [scaleValue, setScaleValue] = useState(1);
  const [scaleX, setScaleX] = useState(0);
  const [scaleY, setScaleY] = useState(0);

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.9rem' // chữ nhỏ hơn
  };

  const inputStyle = {
    width: '50px', // input nhỏ gọn
    padding: '1px', // giảm padding
    fontSize: '0.85rem' // giảm cỡ chữ trong input
  };

  const customStyles = {
    overlay: {
      zIndex: 9999 // 🛠 overlay luôn trên hết
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000
    }
  };
  const [refresh, setRefresh] = useState(false);
  const [data, setData] = useState([]);
  const [dataAnchor, setDataAnchor] = useState([]);
  const [showLines, setShowLines] = useState(false);
  const [userTagData, setUserTagData] = useState([]);
  const [locationValid, setLocationValid] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [forbiddenLocation, setForbiddenLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [track, setTrack] = useState(false);
  const latestDataRef = useRef([]);
  const latestAnchorRef = useRef([]);
  const prevLocationValidRef = useRef([]);
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [openAnchor, setOpenAnchor] = useState(false);
  const [locations, setLocations] = useState([]);
  const [newPoint, setNewPoint] = useState({ x: '', y: '' });
  const dispatch = useDispatch();

  const closeModal = () => {
    setOpenAnchor(false);
    setLocations([]);
    setNewPoint({ x: '', y: '' });
  };

  const handleAddPoint = () => {
    if (newPoint.x && newPoint.y) {
      setLocations([...locations, { x: Number(newPoint.x), y: Number(newPoint.y) }]);
      setNewPoint({ x: '', y: '' });
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    dispatch(actions.controlLoading(true));
    try {
      await apiRequest.post('/zone', { locations });
      setRefresh(!refresh);
      dispatch(actions.controlLoading(false));
      toast.success('Set up khu vực cấm thành công!', { position: 'top-center', autoClose: 2000 });
      closeModal();
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 400) {
        toast.error(error.response.data.message, {
          position: 'top-center',
          autoClose: 2000,
          zIndex: 999999
        });
      }
      if (error.status === 403) {
        toast.error('Không thể set up khu vực cấm nếu không phải admin', {
          position: 'top-center',
          autoClose: 2000
        });
      }
      console.log(error);
    }
  };

  const handleDeleteZone = async (e) => {
    e.preventDefault();
    dispatch(actions.controlLoading(true));
    try {
      await apiRequest.delete('/zone');
      setForbiddenLocation(null);
      setRefresh(!refresh);
      dispatch(actions.controlLoading(false));
      toast.success('Xóa khu vực cấm thành công!', { position: 'top-center', autoClose: 2000 });
      closeModal();
    } catch (error) {
      if (error.status === 403) {
        toast.error('Không thể xóa khu vực cấm nếu không phải admin', {
          position: 'top-center',
          autoClose: 2000
        });
      }
      console.log(error);
    }
  };

  // const forbiddenZonePoints = [
  //   { x: 3, y: 0 },
  //   { x: 5, y: 0 },
  //   { x: 5, y: 2 },
  //   { x: 3, y: 2 }
  // ];

  // function isPointInQuadrilateral(point, quad) {
  //   if (!point || !quad || quad.length !== 4) {
  //     console.warn('Dữ liệu không hợp lệ:', { point, quad });
  //     return false;
  //   }
  //   function crossProduct(a, b, c) {
  //     return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  //   }

  //   let [A, B, C, D] = quad;
  //   let { x, y } = point;
  //   let P = { x, y };

  //   let cross1 = crossProduct(A, B, P) >= 0;
  //   let cross2 = crossProduct(B, D, P) >= 0;
  //   let cross3 = crossProduct(D, C, P) >= 0;
  //   let cross4 = crossProduct(C, A, P) >= 0;

  //   return cross1 === cross2 && cross2 === cross3 && cross3 === cross4;
  // }
  function isPointInPolygon(point, polygon) {
    if (!point || !Array.isArray(polygon) || polygon.length < 3) {
      console.warn('Dữ liệu không hợp lệ:', { point, polygon });
      return false;
    }

    const { x, y } = point;
    let inside = false;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;

      // Kiểm tra nếu đường thẳng từ điểm tới vô cực cắt cạnh (j-i)
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  const toggleLines = () => {
    setShowLines((prev) => !prev);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/device`); // Get all device
      const usersRes = await axios.get(`http://localhost:5000/api/users/tag-user`);
      const zoneRes = await apiRequest.get('/zone');
      const userSettingRes = await apiRequest.get(`/setting`);
      const setting = userSettingRes.data;
      if (zoneRes?.data?.locations) setForbiddenLocation(zoneRes.data.locations);
      setScaleValue(setting.scaleValue || 10);
      setScaleX(setting.scaleX || 0);
      setScaleY(setting.scaleY || 0);
      setBackgroundUrl(setting.mapImage);
      const devices = res.data.filter((item) => item.location);
      const anchors = devices.filter((item) => item.type === 'Anchor').map((item) => item.location);
      const tags = devices.filter((item) => item.type === 'Tag').map((item) => item.location);

      latestAnchorRef.current = anchors.length === 4 ? anchors : latestAnchorRef.current;

      const locationStatus = tags
        .filter((tag) => tag.macAddress !== undefined)
        .map((tag) => ({
          macAddress: tag.macAddress,
          locationValid: isPointInPolygon(tag.location, latestAnchorRef.current),
          forbiddenLocation: (forbiddenLocation && isPointInPolygon(tag.location, forbiddenLocation)) || false
        }));
      if (JSON.stringify(locationValid) !== JSON.stringify(locationStatus)) {
        setLocationValid(locationStatus);
      }
      setUsersData(usersRes.data);
      setData(devices);
      setDataAnchor(anchors);
      latestDataRef.current = devices;
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [refresh]);

  const handleSubmit = async () => {
    const input = { scaleValue, scaleX, scaleY };
    try {
      const settingResponse = await apiRequest.post('/setting', input);
      if (settingResponse?.data) {
        setScaleValue(settingResponse.data.data.scaleValue);
        setScaleX(settingResponse.data.data.scaleX);
        setScaleY(settingResponse.data.data.scaleY);
        if (settingResponse.data.data?.mapImage) setBackgroundUrl(settingResponse.data.data?.mapImage);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Failed to submit setting:', error);
    }
  };

  useEffect(() => {
    socket.on('updateData', async ({ macAddress, transferData }) => {
      try {
        const userResponse = await axios.post('http://localhost:5000/api/users/get-user-by-mac', { macAddress });
        if (userResponse.data) {
          setUserTagData(userResponse.data); // Lưu thông tin user
        }
      } catch (error) {
        console.error('Error fetching user by MAC:', error);
      }
      setData((prevData) => {
        const updatedData = prevData.map((item) => (item.macAddress === macAddress ? { ...item, location: transferData.location } : item));
        const tags = updatedData.filter((item) => item.type === 'Tag');
        const locationStatus = tags
          .filter((tag) => tag.macAddress !== undefined)
          .map((tag) => ({
            macAddress: tag.macAddress,
            locationValid: isPointInPolygon(tag.location, latestAnchorRef.current),
            forbiddenLocation: (forbiddenLocation && isPointInPolygon(tag.location, forbiddenLocation)) || false
          }));
        if (JSON.stringify(locationValid) !== JSON.stringify(locationStatus)) {
          setLocationValid(locationStatus);
        }

        if (tags.length > 0) updateDeviceInDB(tags);
        latestDataRef.current = updatedData;
        return updatedData;
      });
    });
    return () => {
      socket.off('updateData');
    };
  }, []);

  useEffect(() => {
    socket.emit(track ? 'enable_tracking' : 'disable_tracking');
    const device = latestDataRef.current.find((item) => item.type === 'Tag');
    if (device) updateDeviceInDB(device);
  }, [track]);

  useEffect(() => {
    const prevLocationValid = prevLocationValidRef.current;
    const changedItems = locationValid.filter((newItem) => {
      const oldItem = prevLocationValid.find((item) => item.macAddress === newItem.macAddress);
      return !oldItem || oldItem.locationValid !== newItem.locationValid;
    });

    if (changedItems.length > 0) {
      console.log('Các phần tử thay đổi:', changedItems);
      if (userTagData) {
        const checkAndNotify = async () => {
          for (const user of userTagData) {
            const status = changedItems.find((item) => item.macAddress === user.deviceId.macAddress);
            if (status && user.username) {
              if (status.locationValid) {
                try {
                  const res = await checkIn(user.username, user.email);
                  if (res && res.status === 200) {
                    // socket.emit('speaker-checkin', { username: user.username, message: res.data.message });
                    toast.success(res.data.message, {
                      position: 'top-center',
                      autoClose: 2000
                    });
                  }
                } catch (error) {
                  console.error('Check-in error:', error);
                  toast.error('Check-in thất bại!');
                }
                toast.success(`${user.username} đang ở trong khu vực làm việc`, {
                  position: 'top-center',
                  autoClose: 2000
                });
              } else if (status.locationValid === false) {
                const res = await checkOut(user.username, user.email);
                if (res && res.status === 200) {
                  // socket.emit('speaker-checkout', { username: user.username, message: res.data.message });
                  toast.success(res.data.message, {
                    position: 'top-center',
                    autoClose: 2000
                  });
                }
                toast.warn(`${user.username} đang ở ngoài khu vực làm việc`, {
                  position: 'top-center',
                  autoClose: 2000
                });
              }
            }
          }
        };

        checkAndNotify(); // Gọi hàm async
      }
      prevLocationValidRef.current = locationValid; // Cập nhật giá trị mới
    }
  }, [locationValid]);

  useEffect(() => {
    const prevLocationValid = prevLocationValidRef.current;
    const changedItems = locationValid.filter((newItem) => {
      const oldItem = prevLocationValid.find((item) => item.macAddress === newItem.macAddress);
      return !oldItem || oldItem.forbiddenLocation !== newItem.forbiddenLocation;
    });

    if (changedItems.length > 0) {
      if (userTagData) {
        console.log(userTagData);
        userTagData.forEach((user) => {
          const status = changedItems.find((item) => item.macAddress === user.deviceId.macAddress);
          if (status && user.username) {
            if (status.forbiddenLocation) {
              socket.emit('speaker-forbidden', { username: user.username });
              toast.error(
                `${user.username || 'Người dùng'} đang ở trong khu vực cấm. Email cảnh báo đã được gửi tới email ${user.email || 'người dùng'}`,
                {
                  position: 'top-center',
                  autoClose: 2000
                }
              );

              axios
                .post('http://localhost:5000/api/send-alert-email', {
                  location: latestDataRef.current.find((item) => item.type === 'Tag')?.location,
                  email: user.email
                })
                .then((response) => {
                  console.log(`Email cảnh báo đã được gửi tới ${user.email}:`, response.data);
                })
                .catch((error) => {
                  console.error(`Lỗi gửi email cảnh báo đến ${user.email}:`, error);
                });
            }
          }
        });
      }
      prevLocationValidRef.current = locationValid; // Cập nhật giá trị mới
    }
  }, [locationValid]);

  const updateDeviceInDB = async (devices) => {
    try {
      const requests = devices.map((device) =>
        axios.put(`http://localhost:5000/api/device/location`, {
          location: device.location,
          macAddress: device.macAddress
        })
      );

      const responses = await Promise.all(requests);

      if (responses.every((res) => res.status === 200)) {
        console.log('Cập nhật database thành công:', devices);
        fetchData();
      }
    } catch (error) {
      console.error('Lỗi cập nhật database:', error);
    }
  };

  const checkIn = async (username, email) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/attendance/check-in`, {
        username,
        email
      });
      return res;
    } catch (error) {
      console.error('Check in failed:', error);
    }
  };

  const checkOut = async (username, email) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/attendance/check-out`, {
        username,
        email
      });
      return res;
    } catch (error) {
      console.error('Check out failed:', error);
    }
  };

  if (loading) {
    return <div className="home">Loading...</div>;
  }

  if (error) {
    return <div className="home">Error: {error.message}</div>;
  }
  const getLines = () => {
    if (!showLines) return null;
    const tagPins = latestDataRef.current.filter((item) => item.type === 'Tag'); // Lấy tất cả các Tag
    if (tagPins.length === 0) return null;

    return tagPins.flatMap((tag, tagIndex) =>
      latestDataRef.current
        .filter((item) => item.type !== 'Tag')
        .map((item, index) => {
          const x1 = scaleX + Math.round(tag.location.x * scaleValue);
          const y1 = scaleY + Math.round(tag.location.y * scaleValue);
          const x2 = scaleX + Math.round(item.location.x * scaleValue);
          const y2 = scaleY + Math.round(item.location.y * scaleValue);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const distance = calculateDistance(tag.location.x, tag.location.y, item.location.x, item.location.y);
          return (
            <g key={`${tagIndex}-${index}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="gray" strokeDasharray="5,5" strokeWidth="2" />
              <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle" fill="black" fontSize="10">
                {Math.round(distance * 100) / 100}
              </text>
            </g>
          );
        })
    );
  };
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(2);
  };

  // const getDistance = (x, y) => {
  //   const aPin = latestDataRef.current.find((item) => item.type === 'Tag');
  //   if (!aPin) return null;
  //   return Math.sqrt(Math.pow(aPin.location.x - x, 2) + Math.pow(aPin.location.y - y, 2)).toFixed(2);
  // };
  const handleEmergency = async () => {
    try {
      if (Array.isArray(usersData) && usersData.length > 0) {
        toast.error(`Trường hợp khẩn cấp, đã gửi mail cảnh báo tới toàn bộ người dùng có gắn tag`, {
          position: 'top-center',
          autoClose: 2000
        });
        for (const user of usersData) {
          try {
            const response = await apiRequest.post('/send-alert-emails', {
              email: user.email
            });
            console.log(`Email cảnh báo đã được gửi tới ${user.email}:`, response.data);
          } catch (error) {
            console.error(`Lỗi gửi email cảnh báo đến ${user.email}:`, error);
          }
        }
      } else {
        console.warn('Danh sách usersData rỗng hoặc không hợp lệ.');
      }
    } catch (error) {
      console.log('Lỗi tổng thể trong handleEmergency:', error);
    }
  };

  const handleImageUpload = async (event) => {
    // const imageUrl = URL.createObjectURL(file);
    // setBackgroundUrl(imageUrl);

    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await apiRequest.post('/setting/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload thành công:', data);
      // Nếu muốn lấy link file từ server trả về:
      setBackgroundUrl(`/${data.filename}`);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Lỗi khi upload file:', error);
    }
  };

  const MapComponent = ({ backgroundUrl }) => {
    return (
      <div
        className="map"
        style={{
          position: 'relative',
          backgroundImage: `url(${backgroundUrl})`,
          // backgroundImage: `url(../../../public/map.jpg)`,
          // backgroundImage: `url(/map.jpg)`,
          backgroundSize: 'cover', // Thay vì 'contain', dùng 'cover' để ảnh phủ đầy thẻ mà không bị bóp méo
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <svg className="map-svg">{getLines()}</svg>
        {latestDataRef.current.map((item, index) => (
          <div
            key={index}
            className="map-item"
            style={{
              position: 'absolute',
              left: `${scaleX + item.location.x * scaleValue}px`,
              top: `${scaleY + item.location.y * scaleValue}px`
            }}
          >
            <MdLocationPin className="pin" style={{ color: item.type === 'Tag' ? 'green' : 'red' }} size={30} />
            {item.userId ? (
              <p className="map-item-detail">{item.userId.username}</p>
            ) : (
              <>
                <p className="map-item-detail">{item.name}</p>
                <p className="map-item-detail">{item.type}</p>
              </>
            )}
            <p className="map-item-detail">
              x: {item.location.x}, y: {item.location.y}
            </p>
          </div>
        ))}
        {forbiddenLocation && (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <polygon
              points={forbiddenLocation.map((point) => `${scaleX + point.x * scaleValue},${scaleY + point.y * scaleValue}`).join(' ')}
              fill="rgba(255, 0, 0, 0.3)" /* màu đỏ nhạt */
              stroke="red" /* viền */
              strokeWidth="2"
            />
          </svg>
        )}
        {/* {forbiddenZonePoints.map((point, index) => (
          <div
            key={index}
            className="map-item fixed"
            style={{
              position: 'absolute',
              left: `${scaleX + point.x * scaleValue}px`,
              top: `${scaleY + point.y * scaleValue}px`
            }}
          >
            <MdLocationPin className="pin" style={{ color: 'yellow' }} size={30} />
            <p className="map-item-detail">{point.name}</p>
            <p className="map-item-detail">
              x: {point.x}, y: {point.y}
            </p>
          </div>
        ))} */}
      </div>
    );
  };
  return (
    <div className="home">
      <Modal isOpen={openAnchor} onRequestClose={closeModal} contentLabel="Update Modal" style={customStyles}>
        <div className="updateModal">
          <h1>Setup tọa độ khu vực cấm</h1>
          <div className="form-update">
            <span className="close" onClick={closeModal}>
              X
            </span>
            <form onSubmit={handleSubmit2}>
              <div className="item">
                <label>Tọa độ</label>
                <div className="location-inputs">
                  <input type="number" placeholder="X" value={newPoint.x} onChange={(e) => setNewPoint({ ...newPoint, x: e.target.value })} />
                  <input type="number" placeholder="Y" value={newPoint.y} onChange={(e) => setNewPoint({ ...newPoint, y: e.target.value })} />
                  <button className="add-point" type="button" onClick={handleAddPoint}>
                    Thêm
                  </button>
                </div>
              </div>
              <div className="item">
                <label>Danh sách tọa độ khu vực cấm hiện tại</label>
                <ul className="locations-info">
                  {forbiddenLocation && forbiddenLocation.map((loc, index) => <li key={index}>{`(${loc.x}, ${loc.y})`}</li>)}
                  <div className="location-inputs">
                    <button className="delete-zone" type="button" onClick={handleDeleteZone}>
                      Xóa vùng cấm
                    </button>
                  </div>
                </ul>
              </div>
              <div className="item">
                <label>Danh sách tọa độ khu vực cấm điều chỉnh</label>
                <ul className="locations-info">
                  {locations.map((loc, index) => (
                    <li key={index}>{`(${loc.x}, ${loc.y})`}</li>
                  ))}
                </ul>
              </div>
              {/* <div className="item">
                <div className="location-inputs">
                  <button className="delete-zone" type="button" onClick={handleAddPoint}>
                    Xóa vùng cấm
                  </button>
                </div>
              </div> */}

              <button>Gửi</button>
            </form>
          </div>
        </div>
      </Modal>
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* <button style={{ position: 'relative' }}>
          Upload Background
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          />
        </button> */}
      </div>
      <div className="home-container">
        <>
          <MapComponent backgroundUrl={backgroundUrl} />
        </>
        <div className="info">
          <h2>Dữ liệu vị trí</h2>
          <div className="list">
            {latestDataRef.current.map((item, index) => (
              <div key={index} className="list-item">
                <div className="info-item-detail">
                  <span>{item.name}</span>
                  <span>{item.type}</span>
                </div>
                <div className="info-item-detail">
                  <span>x:{item.location.x}</span>
                  <span>y:{item.location.y}</span>
                </div>
                {/* <div className="info-item-detail">
                  <span>Distance:</span>
                  <span>{getDistance(item.location.x, item.location.y)}</span>
                </div> */}
              </div>
            ))}
          </div>
          {/* <h2>Info send by tag</h2>
          <div className="list">
            {latestDataRef.current.map((item, index) => (
              <div key={index} className="list-item">
                <div className="info-item-detail">
                  <span>{item.name}</span>
                  <span>{item.type}</span>
                </div>
                <div className="info-item-detail">
                  <span>x:{item.location.x}</span>
                  <span>y:{item.location.y}</span>
                </div>
                <div className="info-item-detail">
                  <span>Distance:</span>
                  <span>{getDistance(item.location.x, item.location.y)}</span>
                </div>
              </div>
            ))}
          </div> */}
          <div className="wrap-all">
            <div>
              {!showForm ? (
                <button className="scale-btn" onClick={() => setShowForm(true)}>
                  Scale anchor
                </button>
              ) : (
                <>
                  <div style={rowStyle}>
                    <label htmlFor="scaleValue">Giá trị scale:</label>
                    <input
                      id="scaleValue"
                      type="number"
                      value={scaleValue}
                      onChange={(e) => setScaleValue(Number(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                  <div style={rowStyle}>
                    <label htmlFor="scaleX">Scale X:</label>
                    <input id="scaleX" type="number" value={scaleX} onChange={(e) => setScaleX(Number(e.target.value))} style={inputStyle} />
                  </div>
                  <div style={rowStyle}>
                    <label htmlFor="scaleY">Scale Y:</label>
                    <input id="scaleY" type="number" value={scaleY} onChange={(e) => setScaleY(Number(e.target.value))} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <button className="scale-btn-child" onClick={() => setShowForm(false)}>
                      Hủy
                    </button>
                    <button className="scale-btn-child" onClick={handleSubmit}>
                      Lưu
                    </button>
                  </div>
                </>
              )}
            </div>
            <button className="scale-btn" onClick={() => setOpenAnchor(true)}>
              Setup vùng cấm
            </button>
            <button className="emergency-btn" onClick={handleEmergency}>
              Khẩn cấp
            </button>

            <p className="title-upload">Tải bản đồ</p>
            <label className="upload-label">
              <MdUpload size={30} color="white" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="upload-input" />
            </label>
            <div className="home-top">
              <div className="home-top-child">
                <div className="home-title">{showLines ? <span>Hiển thị đường nối</span> : <span>Ẩn đường nối</span>}</div>
                <div className="home-control">
                  <label className="switch">
                    <input type="checkbox" checked={showLines} onClick={toggleLines} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              <div className="home-top-child">
                <div className="home-title">{track ? <span>Realtime</span> : <span>Mặc định</span>}</div>
                <div className="home-control">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={track}
                      onChange={() => {
                        setTrack(!track);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
