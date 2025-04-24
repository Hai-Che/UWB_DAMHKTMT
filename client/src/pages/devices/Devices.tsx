import './devices.scss';
import { useContext, useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import DataTable from '../../components/dataTable/DataTable';
import Modal from 'react-modal';
import React from 'react';
import axios from 'axios';
import * as actions from '../../redux/actions';
import { AuthContext } from '../../context/AuthContext';

const columns: GridColDef[] = [
  { field: '_id', headerName: 'ID', width: 100 },
  {
    field: 'name',
    type: 'string',
    headerName: 'Tên thiết bị',
    width: 100
  },
  {
    field: 'type',
    headerName: 'Loại',
    width: 70,
    type: 'string'
  },
  {
    field: 'macAddress',
    headerName: 'Địa chỉ MAC',
    width: 150,
    type: 'string'
  },
  {
    field: 'operationMode',
    headerName: 'Operation mode',
    width: 100,
    type: 'string'
  },
  {
    field: 'status',
    headerName: 'Trạng thái',
    width: 90,
    type: 'string'
  },
  {
    field: 'ledStatus',
    headerName: 'Led',
    width: 10,
    type: 'boolean'
  },
  {
    field: 'isInitiator',
    headerName: 'Initiator',
    width: 70,
    type: 'boolean'
  }
];

const columns2: GridColDef[] = [
  { field: '_id', headerName: 'ID', width: 220 },
  {
    field: 'deviceId',
    headerName: 'Tên thiết bị anchor',
    width: 100,
    type: 'string'
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
  const { currentUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [openAnchor, setOpenAnchor] = useState(false);
  const [data, setData] = useState<Device[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [anchorData, setAnchorData] = useState<any[]>([]);
  const [locations, setLocations] = useState<{ deviceName: string; x: number; y: number; z: number }[]>([]);
  const [newPoint, setNewPoint] = useState({ deviceName: '', x: '', y: '', z: '' });

  const closeModal = () => {
    setOpen(false);
    setOpenAnchor(false);
    setLocations([]);
    setNewPoint({ deviceName: '', x: '', y: '', z: '' });
  };

  useEffect(() => {
    dispatch(actions.controlLoading(true));
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/device`);
        setData(res.data);
        const res2 = await axios.get(`http://localhost:5000/api/device/get-anchors`);
        if (Array.isArray(res2.data)) {
          setAnchorData(res2.data);
        } else {
          setAnchorData([]);
        }
        dispatch(actions.controlLoading(false));
      } catch (err) {
        dispatch(actions.controlLoading(false));
        console.log(err);
      }
    };

    fetchData();
  }, [refresh]);

  const handleAddPoint = () => {
    if (newPoint.deviceName && newPoint.x && newPoint.y && newPoint.z) {
      setLocations([...locations, { deviceName: newPoint.deviceName, x: Number(newPoint.x), y: Number(newPoint.y), z: Number(newPoint.z) }]);
      setNewPoint({ deviceName: '', x: '', y: '', z: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    dispatch(actions.controlLoading(true));
    try {
      await axios.post(`http://localhost:5000/api/device`, inputs);
      setRefresh(!refresh);
      dispatch(actions.controlLoading(false));

      toast.success('Thêm thiết bị thành công', {
        position: 'top-center',
        autoClose: 2000
      });
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 403) {
        toast.error('Không thể thêm thiết bị nếu không phải admin', {
          position: 'top-center',
          autoClose: 2000
        });
      }
      console.log(error);
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    const updatedLocations = locations.map((loc) => {
      const matchedAnchor = anchorData.find((a) => a.name === loc.deviceName);
      return {
        ...loc,
        deviceName: matchedAnchor ? matchedAnchor.macAddress : loc.deviceName // Thay bằng macAddress nếu tìm thấy
      };
    });
    dispatch(actions.controlLoading(true));
    try {
      await axios.post(`http://localhost:5000/api/device/anchor-setup`, { updatedLocations });
      setRefresh(!refresh);
      dispatch(actions.controlLoading(false));
      toast.success('Khởi tạo vị trí anchor thành công!', { position: 'top-center', autoClose: 2000 });
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 403) {
        toast.error('Không thể khởi tạo vị trí anchor nếu không phải admin', {
          position: 'top-center',
          autoClose: 2000
        });
      }
      console.log(error);
    }
  };

  return (
    <div className="products">
      <div className="info">
        <h1>Quản lý thiết bị</h1>
        {currentUser._doc.role === 'Admin' && <button onClick={() => setOpen(true)}>Thêm thiết bị mới</button>}
        <button onClick={() => setOpenAnchor(true)}>Setup anchor</button>
      </div>
      <DataTable slug="products" columns={columns} rows={data} />
      <Modal isOpen={open} onRequestClose={closeModal} contentLabel="Update Modal" style={customStyles}>
        <div className="updateModal">
          <h1>Thêm thiết bị mới</h1>
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
                      <input type={column.type} id={column.field} name={column.field} placeholder={`Enter ${column.field}`} />
                    )}
                  </div>
                ))}
              <button>Send</button>
            </form>
            {/* <button onClick={closeModal}>Close</button> */}
          </div>
        </div>
      </Modal>
      <Modal isOpen={openAnchor} onRequestClose={closeModal} contentLabel="Update Modal" style={customStyles}>
        <div className="updateModal">
          <h1>Setup tọa độ anchor</h1>
          <div className="form-update">
            <span className="close" onClick={closeModal}>
              X
            </span>
            <form onSubmit={handleSubmit2}>
              {columns2
                .filter((item) => item.field !== '_id')
                .map((column) => (
                  <div className="item" key={column.field}>
                    <label>{column.headerName}</label>
                    {column.field !== 'deviceId' ? (
                      <input type={column.type} id={column.field} name={column.field} placeholder={`Enter ${column.field}`} />
                    ) : (
                      <select
                        id={column.field}
                        name={column.field}
                        defaultValue=""
                        onChange={(e) => {
                          const selectedDevice = e.target.value;
                          setNewPoint((prev) => ({
                            ...prev,
                            deviceName: selectedDevice // Cập nhật deviceName vào newPoint
                          }));
                        }}
                      >
                        <option value="">Danh sách Anchor active</option>
                        {anchorData.map((anchor) => (
                          <option key={anchor} value={anchor?.name}>
                            {anchor?.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              <div className="item">
                <label>Tọa độ</label>
                <div className="location-inputs">
                  <input type="number" placeholder="X" value={newPoint.x} onChange={(e) => setNewPoint({ ...newPoint, x: e.target.value })} />
                  <input type="number" placeholder="Y" value={newPoint.y} onChange={(e) => setNewPoint({ ...newPoint, y: e.target.value })} />
                  <input type="number" placeholder="Z" value={newPoint.z} onChange={(e) => setNewPoint({ ...newPoint, z: e.target.value })} />
                  <button className="add-point" type="button" onClick={handleAddPoint}>
                    Thêm
                  </button>
                </div>
              </div>
              <div className="item">
                <label>Danh sách anchor setup</label>
                <ul className="locations-info">
                  {locations.map((loc, index) => (
                    <li key={index}>{`${loc.deviceName} - (${loc.x}, ${loc.y}, ${loc.z})`}</li>
                  ))}
                </ul>
              </div>

              <button>Gửi</button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Devices;
