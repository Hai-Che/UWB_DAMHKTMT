import { useState, useEffect, useRef } from 'react';
import { MdLocationPin } from 'react-icons/md';
import './home.scss';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000');

const Home = () => {
  const [data, setData] = useState([]);
  const [dataAnchor, setDataAnchor] = useState([]);
  const [locationValid, setLocationValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [track, setTrack] = useState(false);
  const latestDataRef = useRef([]);
  const latestAnchorRef = useRef([]);

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

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/device`); // Get all device
      const devices = res.data.filter((item) => item.location);
      const anchors = devices.filter((item) => item.type === 'Anchor').map((item) => item.location);
      const tags = devices.filter((item) => item.type === 'Tag').map((item) => item.location);

      latestAnchorRef.current = anchors.length === 4 ? anchors : latestAnchorRef.current;
      setLocationValid(isPointInQuadrilateral(tags[0], latestAnchorRef.current));

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
    socket.on('updateData', (transferData) => {
      setData((prevData) => {
        const updatedData = prevData.map((item) => (item.name === 'DWCE07' ? { ...item, location: transferData.location } : item));
        latestDataRef.current = updatedData;
        return updatedData;
      });
      setLocationValid(isPointInQuadrilateral(transferData.location, latestAnchorRef.current));
    });
    return () => {
      socket.off('updateData');
    };
  }, []);

  useEffect(() => {
    socket.emit(track ? 'enable_tracking' : 'disable_tracking');
    const device = latestDataRef.current.find((item) => item.name === 'DWCE07');
    if (device) updateDeviceInDB(device);
  }, [track]);

  useEffect(() => {
    console.log('locationValid changed:', locationValid);
    if (locationValid) {
      toast.success('Bạn đang ở trong vào khu vực làm việc', {
        position: 'top-center',
        autoClose: 2000
      });
    } else {
      toast.warn('Bạn đang ở ngoài khu vực làm việc', {
        position: 'top-center',
        autoClose: 2000
      });
    }
  }, [locationValid]);

  const updateDeviceInDB = async (device) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/device/location`, { location: device.location, macAddress: device.macAddress });

      if (response.status === 200) {
        console.log('Cập nhật database thành công:', device);
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
    const aPin = latestDataRef.current.find((item) => item.type === 'Tag');
    if (!aPin || !aPin.location) return null;

    return latestDataRef.current
      .filter((item) => item.type !== 'Tag')
      .map((item, index) => {
        const x1 = 100 + Math.round(aPin.location.x * 100);
        const y1 = 100 + Math.round(aPin.location.y * 100);
        const x2 = 100 + Math.round(item.location.x * 100);
        const y2 = 100 + Math.round(item.location.y * 100);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const distance = calculateDistance(x1, y1, x2, y2);

        return (
          <g key={index}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeDasharray="5,5" strokeWidth="2" />
            <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" style={{ marginLeft: '10px' }}>
              {Math.round((distance / 100) * 100) / 100}
            </text>
          </g>
        );
      });
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(2);
  };

  const getDistance = (x, y) => {
    const aPin = latestDataRef.current.find((item) => item.type === 'Tag');
    if (!aPin) return null;
    return Math.sqrt(Math.pow(aPin.location.x - x, 2) + Math.pow(aPin.location.y - y, 2)).toFixed(2);
  };

  return (
    <div className="home">
      <div className="home-title">{track ? <span>Is tracking</span> : <span>Switch to track</span>}</div>
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
      <div className="home-container">
        <div className="map">
          <svg className="map-svg">{getLines()}</svg>
          {latestDataRef.current.map((item, index) => (
            <div
              key={index}
              className="map-item"
              style={{
                position: 'absolute',
                left: `${100 + item.location.x * 100}px`,
                top: `${100 + item.location.y * 100}px`
              }}
            >
              <MdLocationPin className="pin" style={{ color: item.type === `Tag` ? `green` : `red` }} size={30} />
              <p className="map-item-detail">{item.name}</p>
              <p className="map-item-detail">{item.type}</p>
              <p className="map-item-detail">
                x: {item.location.x}, y: {item.location.y}
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
                <div className="info-item-detail">
                  <span>Distance:</span>
                  <span>{getDistance(item.location.x, item.location.y)}</span>
                </div>
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
