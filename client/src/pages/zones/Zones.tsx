import './zones.scss';
import { useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import DataTableZone from '../../components/dataTableZone/DataTableZone';
import Modal from 'react-modal';
import React from 'react';
import axios from 'axios';
import * as actions from '../../redux/actions';

const columns: GridColDef[] = [
  { field: '_id', headerName: 'ID', width: 220 },
  {
    field: 'name',
    type: 'string',
    headerName: 'Name',
    width: 150
  },
  {
    field: 'type',
    headerName: 'Type',
    type: 'singleSelect',
    width: 130,
    valueOptions: ['Forbidden', 'Work']
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

interface Zone {
  _id: string;
  name: string;
  type: string;
  locations: { x: number; y: number; z: number }[];
}

const Zones = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Zone[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [locations, setLocations] = useState<{ x: number; y: number; z: number }[]>([]);
  const [newPoint, setNewPoint] = useState({ x: '', y: '', z: '' });

  const closeModal = () => {
    setOpen(false);
    setLocations([]);
    setNewPoint({ x: '', y: '', z: '' });
  };

  useEffect(() => {
    dispatch(actions.controlLoading(true));
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/zone`);
        console.log(res.data);
        setData(res.data);
        dispatch(actions.controlLoading(false));
      } catch (err) {
        dispatch(actions.controlLoading(false));
        console.log(err);
      }
    };
    fetchData();
  }, [refresh]);

  const handleAddPoint = () => {
    if (newPoint.x && newPoint.y && newPoint.z) {
      setLocations([...locations, { x: Number(newPoint.x), y: Number(newPoint.y), z: Number(newPoint.z) }]);
      setNewPoint({ x: '', y: '', z: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    if (locations.length < 3) {
      toast.error('Locations must have at least 3 points', { position: 'top-center', autoClose: 2000 });
      return;
    }

    const newZone = { ...inputs, locations };
    dispatch(actions.controlLoading(true));
    try {
      await axios.post(`http://localhost:5000/api/zone/create`, newZone);
      setRefresh(!refresh);
      dispatch(actions.controlLoading(false));
      toast.success('Zone has been added successfully', { position: 'top-center', autoClose: 2000 });
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
      <DataTableZone slug="products" columns={columns} rows={data} />
      <Modal isOpen={open} onRequestClose={closeModal} contentLabel="Update Modal" style={customStyles}>
        <div className="updateModal">
          <h1>Add new zone</h1>
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
                    {column.field === 'type' ? (
                      <select id={column.field} name={column.field}>
                        <option value="Forbidden">Forbidden</option>
                        <option value="Work">Work</option>
                      </select>
                    ) : (
                      <input type={column.type} id={column.field} name={column.field} placeholder={`Enter ${column.field}`} />
                    )}
                  </div>
                ))}
              <div className="item">
                <label>Locations</label>
                <div className="location-inputs">
                  <input type="number" placeholder="X" value={newPoint.x} onChange={(e) => setNewPoint({ ...newPoint, x: e.target.value })} />
                  <input type="number" placeholder="Y" value={newPoint.y} onChange={(e) => setNewPoint({ ...newPoint, y: e.target.value })} />
                  <input type="number" placeholder="Z" value={newPoint.z} onChange={(e) => setNewPoint({ ...newPoint, z: e.target.value })} />
                  <button className="add-point" type="button" onClick={handleAddPoint}>
                    Add Point
                  </button>
                </div>
              </div>
              <div className="item">
                <label>Points</label>
                <ul className="locations-info">
                  {locations.map((loc, index) => (
                    <li key={index}>{`(${loc.x}, ${loc.y}, ${loc.z})`}</li>
                  ))}
                </ul>
              </div>

              <button>Send</button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Zones;
