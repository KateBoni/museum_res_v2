// import React, { useEffect, useState } from "react";
// import { useAuth } from "../../components/AuthContext";
// import api from "../../api";
// import "../../styles/admin/ManageMuseums.css";

// const ManageMuseums = () => {
//   const { token } = useAuth();
//   const [museums, setMuseums] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [editedMuseum, setEditedMuseum] = useState({});
//   const [newMuseum, setNewMuseum] = useState({
//     name: "",
//     description: "",
//     location: "",
//     type: "other",
//     opening_hours: "",
//     capacity: 200,
//   });
//   const [selectedImage, setSelectedImage] = useState(null);

//   useEffect(() => {
//     fetchMuseums();
//   }, []);

//   const fetchMuseums = async () => {
//     try {
//       const res = await api.get("/api/museums/");
//       setMuseums(res.data);
//     } catch (err) {
//       console.error("Failed to fetch museums", err);
//     }
//   };

//   const deleteMuseum = async (id) => {
//     const confirmed = window.confirm("Are you sure you want to delete this museum? This action cannot be undone.");
  
//     if (!confirmed) return;
  
//     try {
//       await api.delete(`/api/museums/${id}/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       fetchMuseums();
//     } catch (err) {
//       console.error("Failed to delete museum", err);
//     }
//   };
  

//   const startEdit = (museum) => {
//     setEditingId(museum.id);
//     setEditedMuseum({
//       name: museum.name || "",
//       description: museum.description || "",
//       location: museum.location || "",
//       type: museum.type || "other",
//       opening_hours: museum.opening_hours || "",
//       capacity: museum.capacity || 200,
//       photo: null, // Reset to allow new photo selection
//     });
//   };

//   const saveEdit = async () => {
//     const confirmed = window.confirm("Are you sure you want to save these changes?");
//     if (!confirmed) return;
    
//     const formData = new FormData();
//     formData.append("name", editedMuseum.name);
//     formData.append("description", editedMuseum.description);
//     formData.append("location", editedMuseum.location);
//     formData.append("type", editedMuseum.type);
//     formData.append("opening_hours", editedMuseum.opening_hours);
//     formData.append("capacity", Number(editedMuseum.capacity) || 0);
    
//     if (editedMuseum.photo instanceof File) {
//       formData.append("photo", editedMuseum.photo);
//     }

//     try {
//       await api.put(`/api/museums/${editingId}/`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setEditingId(null);
//       fetchMuseums();
//     } catch (err) {
//       console.error("Failed to update museum", err.response?.data || err);
//     }
//   };

//   const handleCreateMuseum = async (e) => {
//     e.preventDefault();

//     const confirmed = window.confirm("Are you sure you want to add this museum?");
//     if (!confirmed) return;
    
//     const formData = new FormData();
//     formData.append("name", newMuseum.name);
//     formData.append("description", newMuseum.description);
//     formData.append("location", newMuseum.location);
//     formData.append("type", newMuseum.type);
//     formData.append("opening_hours", newMuseum.opening_hours);
//     formData.append("capacity", newMuseum.capacity);
//     if (selectedImage) {
//       formData.append("photo", selectedImage);
//     }

//     try {
//       await api.post("/api/museums/", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setNewMuseum({
//         name: "",
//         description: "",
//         location: "",
//         type: "other",
//         opening_hours: "",
//         capacity: 200,
//       });
//       setSelectedImage(null);
//       fetchMuseums();
//     } catch (err) {
//       console.error("Failed to create museum", err.response?.data || err);
//     }
//   };

//   return (
//     <div className="admin-container">
//       <h1 className="admin-title">Admin Dashboard</h1>
//       <h2 className="section-title">Manage Museums</h2>

//       {museums.length === 0 ? (
//         <p className="empty-message">No museums found.</p>
//       ) : (
//         museums.map((museum) => (
//           <div key={museum.id} className="museum-card">
//             {editingId === museum.id ? (
//               <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
//                 <label>Museum Name:</label>
//                 <input
//                   type="text"
//                   value={editedMuseum.name}
//                   onChange={(e) =>
//                     setEditedMuseum({ ...editedMuseum, name: e.target.value })
//                   }
//                   required
//                 />

//                 <label>Description:</label>
//                 <textarea
//                   value={editedMuseum.description}
//                   onChange={(e) =>
//                     setEditedMuseum({ ...editedMuseum, description: e.target.value })
//                   }
//                   rows={2}
//                 />

//                 <label>Location:</label>
//                 <input
//                   type="text"
//                   value={editedMuseum.location}
//                   onChange={(e) =>
//                     setEditedMuseum({ ...editedMuseum, location: e.target.value })
//                   }
//                 />

//                 <label>Type:</label>
//                 <select
//                   value={editedMuseum.type}
//                   onChange={(e) =>
//                     setEditedMuseum({ ...editedMuseum, type: e.target.value })
//                   }
//                 >
//                   <option value="history">History</option>
//                   <option value="art">Art</option>
//                   <option value="science">Science</option>
//                   <option value="ancient">Archaeological Site</option>
//                   <option value="other">Other</option>
//                 </select>

//                 <label>Opening Hours:</label>
//                 <input
//                   type="text"
//                   value={editedMuseum.opening_hours}
//                   onChange={(e) =>
//                     setEditedMuseum({ ...editedMuseum, opening_hours: e.target.value })
//                   }
//                 />

//                 <label>Capacity:</label>
//                 <input
//                   type="number"
//                   value={editedMuseum.capacity}
//                   onChange={(e) =>
//                     setEditedMuseum({ ...editedMuseum, capacity: e.target.value })
//                   }
//                 />

//                 <label>Change Photo:</label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     setEditedMuseum({ ...editedMuseum, photo: e.target.files[0] })
//                   }
//                 />

//                 <div>
//                   <button type="submit" className="save-button">Save</button>
//                   <button
//                     type="button"
//                     className="cancel-button"
//                     onClick={() => setEditingId(null)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             ) : (
//               <>
//                 <div className="museum-info">
//                   <strong className="museum-name">{museum.name}</strong>
//                   <p>{museum.description}</p>
//                 </div>
//                 <div>
//                   <button className="edit-button" onClick={() => startEdit(museum)}>Edit</button>
//                   <button className="delete-button" onClick={() => deleteMuseum(museum.id)}>Delete</button>
//                 </div>
//               </>
//             )}
//           </div>
//         ))
//       )}

//       <h2 className="section-title">Add New Museum</h2>
//       <form className="museum-card" onSubmit={handleCreateMuseum}>
//         <label>Name:</label>
//         <input
//           type="text"
//           value={newMuseum.name}
//           onChange={(e) => setNewMuseum({ ...newMuseum, name: e.target.value })}
//           required
//         />

//         <label>Description:</label>
//         <textarea
//           value={newMuseum.description}
//           onChange={(e) => setNewMuseum({ ...newMuseum, description: e.target.value })}
//           rows={2}
//         />

//         <label>Location:</label>
//         <input
//           type="text"
//           value={newMuseum.location}
//           onChange={(e) => setNewMuseum({ ...newMuseum, location: e.target.value })}
//         />

//         <label>Type:</label>
//         <select
//           value={newMuseum.type}
//           onChange={(e) => setNewMuseum({ ...newMuseum, type: e.target.value })}
//         >
//           <option value="history">History</option>
//           <option value="art">Art</option>
//           <option value="science">Science</option>
//           <option value="ancient">Archaeological Site</option>
//           <option value="other">Other</option>
//         </select>

//         <label>Opening Hours:</label>
//         <input
//           type="text"
//           value={newMuseum.opening_hours}
//           onChange={(e) => setNewMuseum({ ...newMuseum, opening_hours: e.target.value })}
//         />

//         <label>Capacity:</label>
//         <input
//           type="number"
//           value={newMuseum.capacity}
//           onChange={(e) => setNewMuseum({ ...newMuseum, capacity: e.target.value })}
//           min={1}
//         />

//         <label>Photo:</label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setSelectedImage(e.target.files[0])}
//         />
//         {selectedImage && (
//           <img
//             src={URL.createObjectURL(selectedImage)}
//             alt="Preview"
//             style={{ width: "100px", marginTop: "0.5rem", borderRadius: "8px" }}
//           />
//         )}

//         <div>
//           <button type="submit" className="save-button">Add Museum</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ManageMuseums;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import api from "../../api";
import "../../styles/admin/ManageMuseums.css";

const ManageMuseums = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [museums, setMuseums] = useState([]);
  const [newMuseum, setNewMuseum] = useState({
    name: "",
    description: "",
    location: "",
    type: "other",
    opening_hours: "",
    capacity: 200,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const res = await api.get("/api/museums/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMuseums(res.data);
      } catch (err) {
        console.error("Failed to fetch museums", err);
      }
    };

    fetchMuseums();
  }, [token]);

  const handleCreateMuseum = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to add this museum?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("name", newMuseum.name);
    formData.append("description", newMuseum.description);
    formData.append("location", newMuseum.location);
    formData.append("type", newMuseum.type);
    formData.append("opening_hours", newMuseum.opening_hours);
    formData.append("capacity", newMuseum.capacity);
    if (selectedImage) {
      formData.append("photo", selectedImage);
    }

    try {
      await api.post("/api/museums/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setNewMuseum({
        name: "",
        description: "",
        location: "",
        type: "other",
        opening_hours: "",
        capacity: 200,
      });
      setSelectedImage(null);
      // Refresh list after add
      const res = await api.get("/api/museums/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMuseums(res.data);
    } catch (err) {
      console.error("Failed to create museum", err.response?.data || err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Manage Museums</h1>
      <p>Select a museum to view or edit its details:</p>

      <div className="manage-museum-list">
        {museums.map((museum) => (
          <button
            key={museum.id}
            className="manage-museum-list-item"
            onClick={() => navigate(`/admin/museums/${museum.id}`)}
          >
            {museum.name}
          </button>
        ))}
      </div>

      <h2 className="section-title">Add New Museum</h2>
      <form className="museum-card" onSubmit={handleCreateMuseum}>
        <label>Name:</label>
        <input
          type="text"
          value={newMuseum.name}
          onChange={(e) => setNewMuseum({ ...newMuseum, name: e.target.value })}
          required
        />

        <label>Description:</label>
        <textarea
          value={newMuseum.description}
          onChange={(e) => setNewMuseum({ ...newMuseum, description: e.target.value })}
          rows={2}
        />

        <label>Location:</label>
        <input
          type="text"
          value={newMuseum.location}
          onChange={(e) => setNewMuseum({ ...newMuseum, location: e.target.value })}
        />

        <label>Type:</label>
        <select
          value={newMuseum.type}
          onChange={(e) => setNewMuseum({ ...newMuseum, type: e.target.value })}
        >
          <option value="history">History</option>
          <option value="art">Art</option>
          <option value="science">Science</option>
          <option value="ancient">Archaeological Site</option>
          <option value="other">Other</option>
        </select>

        <label>Opening Hours:</label>
        <input
          type="text"
          value={newMuseum.opening_hours}
          onChange={(e) => setNewMuseum({ ...newMuseum, opening_hours: e.target.value })}
        />

        <label>Capacity:</label>
        <input
          type="number"
          value={newMuseum.capacity}
          onChange={(e) => setNewMuseum({ ...newMuseum, capacity: e.target.value })}
          min={1}
        />

        <label>Photo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files[0])}
        />
        {selectedImage && (
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            style={{ width: "100px", marginTop: "0.5rem", borderRadius: "8px" }}
          />
        )}

        <div>
          <button type="submit" className="save-button">Add Museum</button>
        </div>
      </form>
    </div>
  );
};

export default ManageMuseums;
