import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DeviceHistory.scss';
import apiRequest from '../../lib/apiRequest';

const DeviceHistory = () => {
  const [devices, setDevices] = useState([]);
  const [distances, setDistances] = useState([]);
  const [error, setError] = useState(null);
  const [plotUrl, setPlotUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/location');
        setDistances(response.data.distances);
        setDevices(response.data.result);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="device-history error">Error: {error}</div>;
  }

  const handleExport = async (macAddress) => {
    try {
      const response = await apiRequest.post('/location/export-scatter-plot', { macAddress }, { responseType: 'blob' });
      const imageUrl = URL.createObjectURL(response.data);
      setPlotUrl(imageUrl);
      console.log('Response Type:', response.data.type);
      console.log(imageUrl);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="device-history">
      <h2>Lịch sử vị trí của các thiết bị Tag</h2>
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
      <h2 className="h2-under">Khoảng cách di chuyển được mỗi Tag</h2>
      <div className="device-grid">
        {devices.map((device) => (
          <div key={device._id} className="device-card">
            <h3>{device._id}</h3>
            <p className="p-under">{distances[device._id] || 'N/A'} m</p>
            <button onClick={() => handleExport(device._id)}>Export scatter plot</button>
          </div>
        ))}
      </div>
      <div className="button-top">
        <button onClick={() => setPlotUrl(null)}>Clear plot</button>
      </div>
      <div className="img-plot">{plotUrl && <img src={plotUrl} alt="Scatter Plot" />}</div>
    </div>
  );
};

export default DeviceHistory;
