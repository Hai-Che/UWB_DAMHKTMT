import { useEffect, useState } from "react";
import "./devices.scss";
import DataTable from "../../components/dataTable/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import Modal from "react-modal";
import React from "react";
import axios from "axios";
import * as actions from "../../redux/actions";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

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
  },
];

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

interface Device {
  _id: string;
  address: string;
  location: Object;
  name: string;
  operation: string;
  status: string;
  type: string;
}

const Devices = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Device[]>([]);
  const [refresh, setRefresh] = useState(false);

  const closeModal = () => {
    setOpen(false);
  };

  useEffect(() => {
    dispatch(actions.controlLoading(true));
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/device`);
        setData(res.data);
        console.log(res.data);
        dispatch(actions.controlLoading(false));
      } catch (err) {
        dispatch(actions.controlLoading(false));
        console.log(err);
      }
    };

    fetchData();
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    dispatch(actions.controlLoading(true));
    try {
      await axios.post(`http://localhost:5000/api/device`, inputs);
      setRefresh(!refresh);
      dispatch(actions.controlLoading(false));

      toast.success("Device has been added successfully", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (error) {
      dispatch(actions.controlLoading(false));
      console.log(error);
    }
  };

  return (
    <div className="products">
      <div className="info">
        <h1>Devices</h1>
        <button onClick={() => setOpen(true)}>Add New Devices</button>
      </div>
      <DataTable slug="products" columns={columns} rows={data} />
      <Modal
        isOpen={open}
        onRequestClose={closeModal}
        contentLabel="Update Modal"
        style={customStyles}
      >
        <div className="updateModal">
          <h1>Add new device</h1>
          <div className="form-update">
            <span className="close" onClick={closeModal}>
              X
            </span>
            <form onSubmit={handleSubmit}>
              {columns
                .filter((item) => item.field !== "_id")
                .map((column) => (
                  <div className="item">
                    <label>{column.headerName}</label>
                    <input
                      type={column.type}
                      id={column.field}
                      name={column.field}
                      placeholder={`Enter ${column.field}`}
                    />
                  </div>
                ))}
              <button>Send</button>
            </form>
            {/* <button onClick={closeModal}>Close</button> */}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Devices;
