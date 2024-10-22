import { useEffect, useState } from "react";
import "./devices.scss";
import DataTable from "../../components/dataTable/DataTable";
import Add from "../../components/add/Add";
import { GridColDef } from "@mui/x-data-grid";
import React from "react";
import axios from "axios";

const columns: GridColDef[] = [
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
  }
];

const Devices = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  // const [track, setTrack] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/device`);
        setData(res.data);
      } catch (err) {
        console.log(err)
      }
    };

    fetchData();
  }, []);
  // TEST THE API

  // const { isLoading, data } = useQuery({
  //   queryKey: ["allproducts"],
  //   queryFn: () =>
  //     fetch("http://localhost:8800/api/products").then(
  //       (res) => res.json()
  //     ),
  // });

  return (
    <div className="products">
      <div className="info">
        <h1>Devices</h1>
        <button onClick={() => setOpen(true)}>Add New Devices</button>
      </div>
      <DataTable slug="products" columns={columns} rows={data} />
      {/* TEST THE API */}

      {/* {isLoading ? (
        "Loading..."
      ) : (
        <DataTable slug="products" columns={columns} rows={data} />
      )} */}
      {open && <Add slug="product" columns={columns} setOpen={setOpen} />}
    </div>
  );
};

export default Devices;