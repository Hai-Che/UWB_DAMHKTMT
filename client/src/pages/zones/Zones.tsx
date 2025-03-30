import './zones.scss';
import { useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
// import DataTableZone from '../../components/dataTableZone/DataTableZone';
import Modal from 'react-modal';
import React from 'react';
import axios from 'axios';
import * as actions from '../../redux/actions';

const columns: GridColDef[] = [
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

// interface Zone {
//   _id: string;
//   name: string;
//   locations: { deviceName: ''; x: number; y: number; z: number }[];
// }

const Zones = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  // const [data, setData] = useState<Zone[]>([]);
  const [anchorData, setAnchorData] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [locations, setLocations] = useState<{ deviceName: string; x: number; y: number; z: number }[]>([]);
  const [newPoint, setNewPoint] = useState({ deviceName: '', x: '', y: '', z: '' });
  // const [newDevice, setNewDevice] = useState({ deviceName: '' });

  const closeModal = () => {
    setOpen(false);
    setLocations([]);
    setNewPoint({ deviceName: '', x: '', y: '', z: '' });
  };

  useEffect(() => {
    dispatch(actions.controlLoading(true));
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/device/get-anchors`);
        if (Array.isArray(res.data)) {
          setAnchorData(res.data);
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

  // useEffect(() => {
  //   dispatch(actions.controlLoading(true));
  //   const fetchData = async () => {
  //     try {
  //       const res = await axios.get(`http://localhost:5000/api/zone`);
  //       console.log(res.data);
  //       // setData(res.data);
  //       dispatch(actions.controlLoading(false));
  //     } catch (err) {
  //       dispatch(actions.controlLoading(false));
  //       console.log(err);
  //     }
  //   };
  //   fetchData();
  // }, [refresh]);

  const handleAddPoint = () => {
    if (newPoint.deviceName && newPoint.x && newPoint.y && newPoint.z) {
      setLocations([...locations, { deviceName: newPoint.deviceName, x: Number(newPoint.x), y: Number(newPoint.y), z: Number(newPoint.z) }]);
      setNewPoint({ deviceName: '', x: '', y: '', z: '' });
      // setNewDevice({ deviceName: '' });
    }
  };

  const handleSubmit = async (e) => {
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
      console.log(error);
    }
  };

  return (
    <div className="zones">
      <div className="info">
        <h1>Zones</h1>
        <button onClick={() => setOpen(true)}>Add new zone</button>
      </div>
      {/* <DataTableZone slug="products" columns={columns} rows={data} /> */}
      <Modal isOpen={open} onRequestClose={closeModal} contentLabel="Update Modal" style={customStyles}>
        <div className="updateModal">
          <h1>Setup tọa độ anchor</h1>
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

export default Zones;
