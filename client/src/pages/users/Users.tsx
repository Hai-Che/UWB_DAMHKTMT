import './users.scss';
import { useContext, useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import React from 'react';
import axios from 'axios';
import * as actions from '../../redux/actions';
import DataTableUser from '../../components/dataTableUser/DataTableUser';
import Modal from 'react-modal';
import apiRequest from '../../lib/apiRequest';
import { AuthContext } from '../../context/AuthContext';

const columns: GridColDef[] = [
  { field: '_id', headerName: 'ID', width: 220 },
  {
    field: 'email',
    type: 'string',
    headerName: 'Email',
    width: 220
  },
  {
    field: 'username',
    type: 'string',
    headerName: 'Tên đăng nhập',
    width: 120
  },
  {
    field: 'role',
    headerName: 'Quyền',
    width: 80,
    type: 'string'
  },
  {
    field: 'deviceId',
    headerName: 'Device ID',
    width: 100,
    type: 'string'
  },

  { field: 'password', headerName: 'Password', width: 150, type: 'string' }
];

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  deviceId: string;
  password: string;
}

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

const Users = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const closeModal = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    dispatch(actions.controlLoading(true));
    try {
      await apiRequest.post('/auth/register', { username, email, password, role });
      setRefresh(!refresh);
      dispatch(actions.controlLoading(false));

      toast.success('User has been added successfully', {
        position: 'top-center',
        autoClose: 2000
      });
      setTimeout(() => {
        closeModal();
      }, 3000);
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 403) {
        toast.error('Không thể tạo người dùng khác nếu không phải admin', {
          position: 'top-center',
          autoClose: 2000
        });
      }
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(actions.controlLoading(true));
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users`);
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

  return (
    <div className="products">
      <div className="info">
        <h1>Quản lý người dùng</h1>
        {currentUser._doc.role === 'Admin' && <button onClick={() => setOpen(true)}>Thêm người dùng mới</button>}
      </div>
      <DataTableUser slug="products" columns={columns.filter((col) => col.field !== 'password')} rows={data} />
      <Modal isOpen={open} onRequestClose={closeModal} contentLabel="Update Modal" style={customStyles}>
        <div className="updateModal">
          <h1>Thêm người dùng mới</h1>
          <div className="form-update">
            <span className="close" onClick={closeModal}>
              X
            </span>
            <form onSubmit={handleSubmit}>
              {columns
                .filter((item) => item.field !== '_id' && item.field !== 'deviceId')
                .map((column) => (
                  <div className="item" key={column.field}>
                    <label>{column.headerName}</label>
                    {column.field === 'role' ? (
                      <select id={column.field} name={column.field}>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
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
    </div>
  );
};

export default Users;
