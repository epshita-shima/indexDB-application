import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";

const idb = window.indexedDB;

const createCollectionIndexDb = () => {
  if (!idb) {
    console.log("This browser dose not support indexDb");
    return;
  }
  console.log(idb);

  const request = idb.open("test-db", 2);
  request.onerror = (event) => {
    console.log("error", event);
    console.log("An error occured with indexedDB");
  };
  request.onupgradeneeded = (event) => {
    const db = request.result;
    if (!db.objectStoreNames.contains("userData")) {
      db.createObjectStore("userData", {
        keyPath: "id",
      });
    }
  };
  request.onsuccess = () => {
    console.log("Database opened successfully");
  };
};
const App = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [allUsersData, setAllUsersData] = useState([]);
  const [addUser, setAddUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [selectUser, setSelectUser] = useState([]);
  console.log(allUsersData);
  useEffect(() => {
    createCollectionIndexDb();
    getAllData();
  }, []);

  const getAllData = () => {
    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("userData", "readonly");
      const userData = tx.objectStore("userData");
      const users = userData.getAll();

      users.onsuccess = (query) => {
        setAllUsersData(query.srcElement.result);
      };
      users.onerror = (query) => {
        console.log("Occured error ");
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  };
  const handleSubmit = (e) => {
    const dbPromise = idb.open("test-db", 2);

    if (firstName && lastName && email) {
      dbPromise.onsuccess = () => {
        const db = dbPromise.result;
        const tx = db.transaction("userData", "readwrite");
        const userData = tx.objectStore("userData");
       if(addUser){
        const users = userData.put({
          id: allUsersData?.length + 1,
          firstName,
          lastName,
          email,
        });
        users.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
          };
          getAllData();
          alert("dbUser added");
        };
        users.onerror = (event) => {
          console.log(event);
          alert("Error occured");
        };
       }
       else{
        const users = userData.put({
          id: selectUser?.id,
          firstName,
          lastName,
          email,
        });
        users.onsuccess = () => {
          tx.oncomplete = () => {
            db.close();
          };
          getAllData();
          alert("dbUser updated!");
        };
        users.onerror = (event) => {
          console.log(event);
          alert("Error occured");
        };
       }
      };
    }
  };
  const handleDeleteUser=(user)=>{
    const dbPromise = idb.open("test-db", 2);
    dbPromise.onsuccess = () => {
      const db = dbPromise.result;
      const tx = db.transaction("userData", "readwrite");
      const userData = tx.objectStore("userData");
      const deleteUsers = userData.delete(user?.id);

      deleteUsers .onsuccess = (query) => {
       alert('delete successfull');
       getAllData();
      };
      deleteUsers .onerror = (query) => {
        console.log("Occured error ");
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
  }
  return (
    <div className="row" style={{ padding: 100 }}>
      <div className="col-md-6">
        <button
          className="btn btn-primary float-end mb-2"
          onClick={() => {
            setAddUser(true);
            setEditUser(false);
            setSelectUser({});
            setFirstName("");
            setLastName("");
            setEmail("");
          }}
        >
          {" "}
          Add
        </button>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allUsersData?.map((row) => {
              console.log(row);
              return (
                <tr key={row?.id}>
                  <td>{row?.firstName}</td>
                  <td>{row?.lastName}</td>
                  <td>{row?.email}</td>
                  <td>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setAddUser(false);
                        setEditUser(true);
                        setSelectUser(row);
                        setFirstName(row?.firstName);
                        setLastName(row?.lastName);
                        setEmail(row?.email);
                      }}
                    >
                      Edit
                    </button>
                    {""}
                    <button className="btn btn-danger ml-4" onClick={() => {handleDeleteUser(row)}}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="col-md-6">
        {addUser || editUser ? (
          <div className="card" style={{ padding: "20px" }}>
            <h3>{editUser ? "Update User" : "Add user"}</h3>
            <div className="form-group">
              <label htmlFor="">First Name</label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Eamil</label>
              <input
                type="email"
                name="email"
                className="form-control"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="form-group">
              <button className="btn btn-primary mt-2" onClick={handleSubmit}>
                {editUser ? "Update" : "Add"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default App;
