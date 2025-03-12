import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import './datatableuser.scss';
// import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import * as actions from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import apiRequest from '../../lib/apiRequest';

type Props = {
  columns: GridColDef[];
  // rows: object[];
  rows: User[];
  slug: string;
};
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
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

const DataTableUser = (props: Props) => {
  const dispatch = useDispatch();
  const [data, setData] = useState<User[]>(props.rows);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  useEffect(() => {
    setData(props.rows);
  }, [props.rows]);

  const handleDelete = async (_id: any) => {
    dispatch(actions.controlLoading(true));
    try {
      await apiRequest.delete(`/users/${_id}`);
      dispatch(actions.controlLoading(false));
      toast.success('User has been deleted successfully', {
        position: 'top-center',
        autoClose: 2000
      });
      setData((prevData) => prevData.filter((item) => item._id !== _id));
    } catch (error) {
      dispatch(actions.controlLoading(false));
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    dispatch(actions.controlLoading(true));
    try {
      const res = await apiRequest.put(`/users/table-user`, inputs);
      dispatch(actions.controlLoading(false));
      toast.success('User has been updated successfully', {
        position: 'top-center',
        autoClose: 2000
      });
      setData((prevData) => prevData.map((item) => (item._id === res.data._id ? res.data : item)));
      closeModal();
    } catch (error) {
      dispatch(actions.controlLoading(false));
      console.log(error);
    }
  };

  const handleUpdate = (row: any) => {
    setSelectedRow(row);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const actionColumn: GridColDef = {
    field: 'action',
    headerName: 'Action',
    width: 100,
    renderCell: (params) => {
      return (
        <div className="action">
          <div className="update" onClick={() => handleUpdate(params.row)}>
            <img src="/view.svg" alt="" />
          </div>
          <div className="delete" onClick={() => handleDelete(params.row._id)}>
            <img src="/delete.svg" alt="" />
          </div>
        </div>
      );
    }
  };

  return (
    data && (
      <div className="dataTable">
        <DataGrid
          className="dataGrid"
          getRowId={(row) => row._id}
          rows={data}
          columns={[...props.columns, actionColumn]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10
              }
            }
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 }
            }
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
          disableColumnSelector
        />
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Update Modal" style={customStyles}>
          <div className="updateModal">
            <h1>Update Device</h1>
            {selectedRow && (
              <div className="form-update">
                <span className="close" onClick={closeModal}>
                  X
                </span>
                <form onSubmit={handleSubmit}>
                  {props.columns
                    .filter((item) => item.field !== '_id' && item.field !== 'role')
                    .map((column) => (
                      <div className="item" key={column.field}>
                        <label>{column.headerName}</label>
                        <input type={column.type} id={column.field} name={column.field} placeholder={`Enter ${column.field}`} />
                      </div>
                    ))}
                  <input type="hidden" id="_id" name="_id" value={selectedRow['_id']}></input>
                  <button>Send</button>
                </form>
                {/* <button onClick={closeModal}>Close</button> */}
              </div>
            )}
          </div>
        </Modal>
      </div>
    )
  );
};

export default DataTableUser;
