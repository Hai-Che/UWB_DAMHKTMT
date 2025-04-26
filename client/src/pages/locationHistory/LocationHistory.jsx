import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DeviceHistory.scss';
import apiRequest from '../../lib/apiRequest';

const DeviceHistory = () => {
  const [devices, setDevices] = useState([]);
  const [distances, setDistances] = useState([]);
  const [error, setError] = useState(null);
  const [plotUrl, setPlotUrl] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  function getEvenlySpacedElements(array, count) {
    if (array.length === 0) return [];
    if (array.length <= count) return array; // Nếu mảng có ít phần tử hơn count, trả về toàn bộ mảng

    const step = (array.length - 1) / (count - 1);
    return Array.from({ length: count }, (_, i) => array[Math.round(i * step)]);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/location', {
          params: {
            date: selectedDate,
            time: selectedTime
          }
        });
        console.log(response.data.distances);
        setDistances(response.data.distances);
        setDevices(response.data.result);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [selectedDate, selectedTime]);

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
      <div className="filter-container">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
          {[...Array(24).keys()].map((hour) => (
            <option key={hour} value={`${hour.toString().padStart(2, '0')}:00:00`}>
              {hour.toString().padStart(2, '0')}:00
            </option>
          ))}
        </select>{' '}
      </div>
      <div className="device-grid">
        {devices.map((device) => (
          <div key={device._id} className="device-card">
            <h3>{device._id}</h3>
            <ul>
              {getEvenlySpacedElements(device.locations, 10).map((entry, index) => (
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
      <h2 className="h2-under">Quãng đường di chuyển được mỗi Tag</h2>
      <div className="device-grid">
        {devices.map((device) => (
          <div key={device._id} className="device-card">
            <h3>{device._id}</h3>
            {/* <p className="p-under">{distances[device._id] || '0'} m</p> */}
            <button onClick={() => handleExport(device._id)}>Vẽ quãng đường di chuyển</button>
          </div>
        ))}
      </div>
      <div className="button-top">
        <button onClick={() => setPlotUrl(null)}>Làm mới</button>
      </div>
      <div className="img-plot">{plotUrl && <img src={plotUrl} alt="Scatter Plot" />}</div>
    </div>
  );
};

export default DeviceHistory;
