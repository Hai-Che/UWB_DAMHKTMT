import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions';
import './attendances.scss';

const Attendance = () => {
  const dispatch = useDispatch();

  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    dispatch(actions.controlLoading(true));
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/attendance`);
        setAttendances(res.data);
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
    <TableContainer component={Paper} className="attendance-table">
      <h2>Quản lý ca vụ</h2>
      <Table>
        <TableHead className="MuiTableHead-root">
          <TableRow>
            <TableCell className="MuiTableCell-head">Avatar</TableCell>
            <TableCell className="MuiTableCell-head">Username</TableCell>
            <TableCell className="MuiTableCell-head">Email</TableCell>
            <TableCell className="MuiTableCell-head">Check-in</TableCell>
            <TableCell className="MuiTableCell-head">Check-out</TableCell>
            <TableCell className="MuiTableCell-head">Work Duration (hours)</TableCell>
            <TableCell className="MuiTableCell-head">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="MuiTableBody-root">
          {attendances.map((attendance) => (
            <TableRow key={attendance._id} className="MuiTableRow-root">
              <TableCell className="avatar-cell">
                <Avatar src={attendance.userId?.avatar || ''} alt={attendance.userId?.username} className="MuiAvatar-root" />
              </TableCell>
              <TableCell>
                <Typography>{attendance.userId?.username || 'N/A'}</Typography>
              </TableCell>
              <TableCell>{attendance.userId?.email || 'N/A'}</TableCell>
              <TableCell>{attendance.checkIn || 'N/A'}</TableCell>
              <TableCell>{attendance.checkOut || 'N/A'}</TableCell>
              <TableCell>{attendance.workDuration || 0}</TableCell>
              <TableCell>{attendance.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Attendance;
