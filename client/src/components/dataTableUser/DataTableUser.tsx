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
  deviceId: string;
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
  const [refresh, setRefresh] = useState(false);

  const [tagData, setTagData] = useState<string[]>([]);

  useEffect(() => {
    dispatch(actions.controlLoading(true));
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/device/get-tags`);
        if (Array.isArray(res.data)) {
          setTagData(res.data.map((tag: any) => tag.name));
        } else {
          setTagData([]);
        }
        dispatch(actions.controlLoading(false));
      } catch (err) {
        dispatch(actions.controlLoading(false));
        console.log(err);
      }
    };

    fetchData();
  }, [refresh]);

  useEffect(() => {
    setData(props.rows);
  }, [props.rows]);

  const handleDelete = async (_id: any) => {
    dispatch(actions.controlLoading(true));
    try {
      await apiRequest.delete(`/users/${_id}`);
      dispatch(actions.controlLoading(false));
      toast.success('Xóa người dùng thành công', {
        position: 'top-center',
        autoClose: 2000
      });
      setData((prevData) => prevData.filter((item) => item._id !== _id));
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 403) {
        toast.error('Không thể xóa người dùng khác nếu không phải admin', {
          position: 'top-center',
          autoClose: 2000
        });
      }
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
      setRefresh(!refresh);

      toast.success('Cập nhật người dùng thành công', {
        position: 'top-center',
        autoClose: 2000
      });
      setData((prevData) => prevData.map((item) => (item._id === res.data._id ? res.data : item)));
      closeModal();
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 403) {
        toast.error('Không thể cập nhật người dùng khác nếu không phải admin', {
          position: 'top-center',
          autoClose: 2000
        });
      }
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
            <h1>Update user</h1>
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
                        {column.field !== 'deviceId' ? (
                          <input
                            type="text"
                            id={column.field}
                            name={column.field}
                            placeholder={`Enter ${column.field}`}
                            defaultValue={selectedRow[column.field]}
                          />
                        ) : (
                          <select id={column.field} name={column.field} defaultValue="">
                            <option value="">Danh sách tag active</option>
                            {tagData.map((tag) => (
                              <option key={tag} value={tag}>
                                {tag}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  <input type="hidden" id="_id" name="_id" value={selectedRow['_id']}></input>
                  <button>Send</button>
                </form>
              </div>
            )}
          </div>
        </Modal>
      </div>
    )
  );
};

export default DataTableUser;
