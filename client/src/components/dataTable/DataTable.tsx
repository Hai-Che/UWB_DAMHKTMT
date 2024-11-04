import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import "./dataTable.scss";
// import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import * as actions from "../../redux/actions";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

type Props = {
  columns: GridColDef[];
  // rows: object[];
  rows: Device[];
  slug: string;
};

interface Device {
  _id: string;
  address: string;
  location: Object;
  name: string;
  operation: string;
  status: string;
  type: string;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
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

  const handleDelete = async (name: string) => {
    dispatch(actions.controlLoading(true));
    try {
      await axios.delete(`http://localhost:5000/api/device/${name}`);
      dispatch(actions.controlLoading(false));
      toast.success("Device has been deleted successfully", {
        position: "top-center",
        autoClose: 2000,
      });
      setData((prevData) => prevData.filter((item) => item.name !== name));
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
      const res = await axios.put(`http://localhost:5000/api/device`, inputs);
      dispatch(actions.controlLoading(false));
      toast.success("Device has been updated successfully", {
        position: "top-center",
        autoClose: 2000,
      });
      setData((prevData) =>
        prevData.map((item) => (item._id === res.data._id ? res.data : item))
      );
      setTimeout(() => {
        closeModal();
      }, 3000);
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
    field: "action",
    headerName: "Action",
    width: 100,
    renderCell: (params) => {
      return (
        <div className="action">
          {/* <Link to={`/devices/${params.row.name}`}> */}
          <div className="update" onClick={() => handleUpdate(params.row)}>
            <img src="/view.svg" alt="" />
          </div>
          {/* </Link> */}
          <div className="delete" onClick={() => handleDelete(params.row.name)}>
            <img src="/delete.svg" alt="" />
          </div>
        </div>
      );
    },
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
                pageSize: 10,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          pageSizeOptions={[5]}
          checkboxSelection
          disableRowSelectionOnClick
          disableColumnFilter
          disableDensitySelector
          disableColumnSelector
        />
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Update Modal"
          style={customStyles}
        >
          <div className="updateModal">
            <h1>Update Device</h1>
            {selectedRow && (
              <div className="form-update">
                <span className="close" onClick={closeModal}>
                  X
                </span>
                <form onSubmit={handleSubmit}>
                  {props.columns
                    .filter((item) => item.field !== "_id")
                    .map((column) => (
                      <div className="item">
                        <label>{column.headerName}</label>
                        <input
                          type={column.type}
                          id={column.field}
                          name={column.field}
                          placeholder={selectedRow[column.field]}
                        />
                      </div>
                    ))}
                  <input
                    type="hidden"
                    id="_id"
                    name="_id"
                    value={selectedRow["_id"]}
                  ></input>
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
