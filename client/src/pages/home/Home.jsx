import { useState, useEffect } from "react";
import { MdLocationPin } from "react-icons/md";
import "./home.scss";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [track, setTrack] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/device`);
        const filterData = res.data.filter((item) => item.location);
        setData(filterData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();

    if (data.length > 0 && track) {
      socket.on("updateData", (newData) => {
        const updatedData = data.map((item) =>
          item.name === newData.name
            ? { ...item, location: newData.location }
            : item
        );
        setData(updatedData);
      });
    }

    return () => {
      socket.off("updateData");
    };
  }, [track]);

  if (loading) {
    return <div className="home">Loading...</div>;
  }

  if (error) {
    return <div className="home">Error: {error.message}</div>;
  }
  const getLines = () => {
    const aPin = data.find((item) => item.type === "Tag");
    if (!aPin || !aPin.location) return null;

    return data
      .filter((item) => item.type !== "Tag")
      .map((item, index) => {
        const x1 = aPin.location.x;
        const y1 = aPin.location.y;
        const x2 = item.location.x;
        const y2 = item.location.y;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const distance = calculateDistance(x1, y1, x2, y2);

        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeDasharray="5,5"
              strokeWidth="2"
            />
            <text
              x={midX}
              y={midY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="10"
              style={{ marginLeft: "10px" }}
            >
              {distance}
            </text>
          </g>
        );
      });
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(2);
  };

  const getDistance = (x, y) => {
    const aPin = data.find((item) => item.type === "Tag");
    if (!aPin) return null;
    return Math.sqrt(
      Math.pow(aPin.location.x - x, 2) + Math.pow(aPin.location.y - y, 2)
    ).toFixed(2);
  };

  return (
    <div className="home">
      <div className="home-title">
        {track ? <span>Is tracking</span> : <span>Switch to track</span>}
      </div>
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
          {data.map((item, index) => (
            <div
              key={index}
              className="map-item"
              style={{
                position: "absolute",
                left: `${item.location.x}px`,
                top: `${item.location.y}px`,
              }}
            >
              <MdLocationPin
                className="pin"
                style={{ color: item.type === `Tag` ? `green` : `red` }}
                size={30}
              />
              <p className="map-item-detail">{item.name}</p>
              <p className="map-item-detail">{item.type}</p>
              <p className="map-item-detail">
                x: {item.location.x}, y: {item.location.y}
              </p>
            </div>
          ))}
        </div>
        <div className="info">
          <h1>Tracking info</h1>
          <div className="list">
            {data.map((item, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default Home;
