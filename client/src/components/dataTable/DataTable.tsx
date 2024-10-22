import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import "./dataTable.scss";
// import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import Modal from "react-modal";

type Props = {
  columns: GridColDef[];
  rows: object[];
  slug: string;
};

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

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const handleDelete = async (name: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/device/${name}`);
      return window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    try {
      await axios.put(`http://localhost:5000/api/device`, inputs);
      return window.location.reload();
    } catch (error) {
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
    <div className="dataTable">
      <DataGrid
        className="dataGrid"
        getRowId={(row) => row._id}
        rows={props.rows}
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
  );
};

export default DataTable;
