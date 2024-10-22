import { useParams, useSearchParams } from "react-router-dom";
import "./deviceDetail.scss";
import { useEffect, useState } from "react";
import axios from "axios";
const DeviceDetail = () => {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { field: "_id", headerName: "ID", width: 250 },
    {
      field: "name",
      type: "string",
      headerName: "Device name",
      width: 100,
    },
    {
      field: "type",
      headerName: "Device type",
      width: 100,
      type: "string",
    },
    {
      field: "address",
      headerName: "Device address",
      width: 150,
      type: "string",
    },
    {
      field: "operation",
      headerName: "Device operation",
      width: 150,
      type: "string",
    },
    {
      field: "status",
      headerName: "Device status",
      width: 120,
      type: "string",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/device/:${name}`
        );
        setData(res.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="home">Loading...</div>;
  }

  if (error) {
    return <div className="home">Error: {error.message}</div>;
  }

  return (
    <div className="device-detail">
      <form>
        {columns
          // .filter((item) => item.field !== "_id" && item.field !== "status")
          .map((column) => (
            <div className="item">
              <label>{column.headerName}</label>
              <input
                type={column.type}
                id={column.field}
                name={column.field}
                placeholder={column.field}
              />
            </div>
          ))}
        <button>Send</button>
      </form>
    </div>
  );
};

export default DeviceDetail;
