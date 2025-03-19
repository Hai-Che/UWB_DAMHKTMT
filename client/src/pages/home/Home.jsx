import { useState, useEffect, useRef } from 'react';
import { MdLocationPin } from 'react-icons/md';
import './home.scss';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { Stage, Layer, Polygon } from 'react-konva';
const socket = io('http://localhost:5000');
const scaleValue = 50;
const Home = () => {
  const [data, setData] = useState([]);
  const [dataAnchor, setDataAnchor] = useState([]);
  const [showLines, setShowLines] = useState(false);
  const [userTagData, setUserTagData] = useState([]);
  const [locationValid, setLocationValid] = useState([]);
  // const [forbiddenLocation, setForbiddenLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [track, setTrack] = useState(false);
  const latestDataRef = useRef([]);
  const latestAnchorRef = useRef([]);
  const prevLocationValidRef = useRef([]);

  const forbiddenZonePoints = [
    { x: 10, y: 2, name: 'P1' },
    { x: 10, y: 6, name: 'P2' },
    { x: 14, y: 2, name: 'P3' },
    { x: 14, y: 6, name: 'P4' }
  ];

  function isPointInQuadrilateral(point, quad) {
    if (!point || !quad || quad.length !== 4) {
      console.warn('Dữ liệu không hợp lệ:', { point, quad });
      return false;
    }
    function crossProduct(a, b, c) {
      return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }

    let [A, B, C, D] = quad;
    let { x, y } = point;
    let P = { x, y };

    let cross1 = crossProduct(A, B, P) >= 0;
    let cross2 = crossProduct(B, D, P) >= 0;
    let cross3 = crossProduct(D, C, P) >= 0;
    let cross4 = crossProduct(C, A, P) >= 0;

    return cross1 === cross2 && cross2 === cross3 && cross3 === cross4;
  }

  const toggleLines = () => {
    setShowLines((prev) => !prev);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/device`); // Get all device
      const devices = res.data.filter((item) => item.location);
      const anchors = devices.filter((item) => item.type === 'Anchor').map((item) => item.location);
      const tags = devices.filter((item) => item.type === 'Tag').map((item) => item.location);

      latestAnchorRef.current = anchors.length === 4 ? anchors : latestAnchorRef.current;

      const locationStatus = tags
        .filter((tag) => tag.macAddress !== undefined)
        .map((tag) => ({
          macAddress: tag.macAddress,
          locationValid: isPointInQuadrilateral(tag.location, latestAnchorRef.current),
          forbiddenLocation: isPointInQuadrilateral(tag.location, forbiddenZonePoints)
        }));
      if (JSON.stringify(locationValid) !== JSON.stringify(locationStatus)) {
        setLocationValid(locationStatus);
      }

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
  }, []);

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
            locationValid: isPointInQuadrilateral(tag.location, latestAnchorRef.current),
            forbiddenLocation: isPointInQuadrilateral(tag.location, forbiddenZonePoints)
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
    // if (JSON.stringify(prevLocationValidRef.current) !== JSON.stringify(locationValid)) {
    //   console.log('locationValid changed:', locationValid);
    //   prevLocationValidRef.current = locationValid; // Cập nhật giá trị mới
    // }
    const prevLocationValid = prevLocationValidRef.current;
    const changedItems = locationValid.filter((newItem) => {
      const oldItem = prevLocationValid.find((item) => item.macAddress === newItem.macAddress);
      return !oldItem || oldItem.locationValid !== newItem.locationValid;
    });

    if (changedItems.length > 0) {
      console.log('Các phần tử thay đổi:', changedItems);
      if (userTagData) {
        console.log(userTagData);
        userTagData.forEach((user) => {
          const status = changedItems.find((item) => item.macAddress === user.deviceId.macAddress);
          if (status && user.username) {
            if (status.locationValid) {
              toast.success(`${user.username} đang ở trong khu vực làm việc`, {
                position: 'top-center',
                autoClose: 2000
              });
            } else if (status.locationValid === false) {
              toast.warn(`${user.username} đang ở ngoài khu vực làm việc`, {
                position: 'top-center',
                autoClose: 2000
              });
            }
          }
        });
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
      console.log('Các phần tử thay đổi:', changedItems);
      if (userTagData) {
        console.log(userTagData);
        userTagData.forEach((user) => {
          const status = changedItems.find((item) => item.macAddress === user.deviceId.macAddress);
          if (status && user.username) {
            if (status.forbiddenLocation) {
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
          const x1 = 100 + Math.round(tag.location.x * scaleValue);
          const y1 = 100 + Math.round(tag.location.y * scaleValue);
          const x2 = 100 + Math.round(item.location.x * scaleValue);
          const y2 = 100 + Math.round(item.location.y * scaleValue);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const distance = calculateDistance(x1, y1, x2, y2);

          return (
            <g key={`${tagIndex}-${index}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeDasharray="5,5" strokeWidth="2" />
              <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10">
                {Math.round((distance / 100) * 100) / 100}
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

  return (
    <div className="home">
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
          <div className="home-title">{track ? <span>Định vị realtime</span> : <span>Định vị mặc định</span>}</div>
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
      <div className="home-container">
        <div className="map">
          <svg className="map-svg">{getLines()}</svg>
          {latestDataRef.current.map((item, index) => (
            <div
              key={index}
              className="map-item"
              style={{
                position: 'absolute',
                left: `${100 + item.location.x * scaleValue}px`,
                top: `${100 + item.location.y * scaleValue}px`
              }}
            >
              <MdLocationPin className="pin" style={{ color: item.type === `Tag` ? `green` : `red` }} size={30} />
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
          {forbiddenZonePoints.map((point, index) => (
            <div
              key={index}
              className="map-item fixed"
              style={{ position: 'absolute', left: `${100 + point.x * scaleValue}px`, top: `${100 + point.y * scaleValue}px` }}
            >
              <MdLocationPin className="pin" style={{ color: 'yellow' }} size={30} />
              <p className="map-item-detail">{point.name}</p>
              <p className="map-item-detail">
                x: {point.x}, y: {point.y}
              </p>
            </div>
          ))}
        </div>
        <div className="info">
          <h2>Tracking info</h2>
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
        </div>
      </div>
    </div>
  );
};

export default Home;
