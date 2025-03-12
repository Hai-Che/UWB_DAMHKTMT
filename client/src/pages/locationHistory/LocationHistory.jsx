import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DeviceHistory.scss';

const DeviceHistory = () => {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/location');
        setDevices(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="device-history error">Error: {error}</div>;
  }

  return (
    <div className="device-history">
      <h2>Lịch sử vị trí thiết bị</h2>
      <div className="device-grid">
        {devices.map((device) => (
          <div key={device._id} className="device-card">
            <h3>{device._id}</h3>
            <ul>
              {device.locations.map((entry, index) => (
                <li key={index} className="location-item">
                  <span className="time">{entry.time}</span>
                  <span className="coordinates">
                    X: {entry.location.x}, Y: {entry.location.y}, Z: {entry.location.z}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceHistory;
