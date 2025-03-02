import { useEffect, useState } from 'react';
import './devices.scss';
import DataTable from '../../components/dataTable/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import Modal from 'react-modal';
import React from 'react';
import axios from 'axios';
import * as actions from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const columns: GridColDef[] = [
  { field: '_id', headerName: 'ID', width: 220 },
  {
    field: 'name',
    type: 'string',
    headerName: 'Name',
    width: 80
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 70,
    type: 'string'
  },
  {
    field: 'macAddress',
    headerName: 'Mac address',
    width: 150,
    type: 'string'
  },
  {
    field: 'operationMode',
    headerName: 'Device operation mode',
    width: 160,
    type: 'string'
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 70,
    type: 'string'
  },
  {
    field: 'ledStatus',
    headerName: 'Led',
    width: 70,
    type: 'boolean'
  },
  {
    field: 'isInitiator',
    headerName: 'Initiator',
    width: 70,
    type: 'boolean'
  }
];

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

interface Device {
  _id: string;
  macAddress: string;
  location: Object;
  name: string;
  operationMode: string;
  status: string;
  type: string;
  ledStatus: boolean;
  isInitiator: boolean;
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

      toast.success('Device has been added successfully', {
        position: 'top-center',
        autoClose: 2000
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
                .filter((item) => item.field !== '_id')
                .map((column) => (
                  <div className="item" key={column.field}>
                    <label>{column.headerName}</label>
                    {column.type === 'boolean' ? (
                      <select id={column.field} name={column.field}>
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                    ) : column.field === 'type' ? (
                      <select id={column.field} name={column.field}>
                        <option value="Anchor">Anchor</option>
                        <option value="Tag">Tag</option>
                      </select>
                    ) : column.field === 'status' ? (
                      <select id={column.field} name={column.field}>
                        <option value="active">Active</option>
                        <option value="passive">Passive</option>
                        <option value="off">Off</option>
                      </select>
                    ) : (
                      <input
                        type={column.type}
                        id={column.field}
                        name={column.field}
                        placeholder={`Enter ${column.field}`}
                      />
                    )}
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
