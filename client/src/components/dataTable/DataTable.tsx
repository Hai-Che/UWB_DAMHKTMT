import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import './dataTable.scss';
// import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import * as actions from '../../redux/actions';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

type Props = {
  columns: GridColDef[];
  // rows: object[];
  rows: Device[];
  slug: string;
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

const DataTable = (props: Props) => {
  const dispatch = useDispatch();
  // TEST THE API

  // const queryClient = useQueryClient();
  // // const mutation = useMutation({
  // //   mutationFn: (id: number) => {
  // //     return fetch(`http://localhost:8800/api/${props.slug}/${id}`, {
  // //       method: "delete",
  // //     });
  // //   },
  // //   onSuccess: ()=>{
  // //     queryClient.invalidateQueries([`all${props.slug}`]);
  // //   }
  // // });
  const [data, setData] = useState<Device[]>(props.rows);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  useEffect(() => {
    setData(props.rows);
  }, [props.rows]);

  const handleDelete = async (macAddress: string) => {
    dispatch(actions.controlLoading(true));
    try {
      await axios.delete(`http://localhost:5000/api/device/${macAddress}`);
      dispatch(actions.controlLoading(false));
      toast.success('Device has been deleted successfully', {
        position: 'top-center',
        autoClose: 2000
      });
      setData((prevData) => prevData.filter((item) => item.macAddress !== macAddress));
      console.log(data);
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 403) {
        toast.error('Không thể xóa thiết bị nếu không phải admin', {
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
      const res = await axios.put(`http://localhost:5000/api/device`, inputs);
      dispatch(actions.controlLoading(false));
      toast.success('Device has been updated successfully', {
        position: 'top-center',
        autoClose: 2000
      });
      setData((prevData) => prevData.map((item) => (item._id === res.data._id ? res.data : item)));
      closeModal();
    } catch (error) {
      dispatch(actions.controlLoading(false));
      if (error.status === 403) {
        toast.error('Không thể cập nhật thiết bị nếu không phải admin', {
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
          {/* <Link to={`/devices/${params.row.name}`}> */}
          <div className="update" onClick={() => handleUpdate(params.row)}>
            <img src="/view.svg" alt="" />
          </div>
          {/* </Link> */}
          <div className="delete" onClick={() => handleDelete(params.row.macAddress)}>
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
                    .filter((item) => item.field !== '_id' && item.field !== 'operationMode')
                    .map((column) => (
                      // <div className="item">
                      //   <label>{column.headerName}</label>
                      //   <input
                      //     type={column.type}
                      //     id={column.field}
                      //     name={column.field}
                      //     placeholder={selectedRow[column.field]}
                      //   />
                      // </div>
                      <div className="item" key={column.field}>
                        <label>{column.headerName}</label>
                        {column.type === 'boolean' ? (
                          <select id={column.field} name={column.field}>
                            <option value="">Default</option>
                            <option value="false">False</option>
                            <option value="true">True</option>
                          </select>
                        ) : column.field === 'type' ? (
                          <select id={column.field} name={column.field}>
                            <option value="">Default</option>
                            <option value="Anchor">Anchor</option>
                            <option value="Tag">Tag</option>
                          </select>
                        ) : column.field === 'status' ? (
                          <select id={column.field} name={column.field}>
                            <option value="">Default</option>
                            <option value="active">Active</option>
                            <option value="passive">Passive</option>
                            <option value="off">Off</option>
                          </select>
                        ) : (
                          <input type={column.type} id={column.field} name={column.field} placeholder={`Enter ${column.field}`} />
                        )}
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

export default DataTable;
