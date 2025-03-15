import { useEffect, useState } from 'react';
import './users.scss';
import { GridColDef } from '@mui/x-data-grid';
import React from 'react';
import axios from 'axios';
import * as actions from '../../redux/actions';
import { useDispatch } from 'react-redux';
import DataTableUser from '../../components/dataTableUser/DataTableUser';

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
    headerName: 'Username',
    width: 100
  },
  {
    field: 'role',
    headerName: 'Role',
    width: 100,
    type: 'string'
  },
  {
    field: 'deviceId',
    headerName: 'Device ID',
    width: 100,
    type: 'string'
  }
];

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  deviceId: string;
}

const Users = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<User[]>([]);

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
  }, []);

  return (
    <div className="products">
      <div className="info">
        <h1>Users</h1>
      </div>
      <DataTableUser slug="products" columns={columns} rows={data} />
    </div>
  );
};

export default Users;
