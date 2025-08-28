// import React, { useState, useEffect } from "react";
// import { useUser } from "@clerk/clerk-react";
// import "../components/MyPeople/MyPeople.css"

// const MyPeople = () => {
//   const { user, isLoaded } = useUser(); // must be inside component

//   const [mongoId, setMongoId] = useState(null);
//   const [people, setPeople] = useState([]);
//   const [selectedPerson, setSelectedPerson] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editFormData, setEditFormData] = useState({});

//   // Fetch mongo user id
//   useEffect(() => {
//     if (!isLoaded || !user) return;

//     const fetchMongoUserId = async () => {
//       try {
//         const res = await fetch(`http://localhost:5001/user/${user.id}`);
//         if (!res.ok) throw new Error("User not found in Mongo");
//         const data = await res.json();
//         setMongoId(data._id);
//         console.log("Mongo user ID:", data._id);
//       } catch (err) {
//         console.error("Error fetching mongoId", err);
//       }
//     };

//     fetchMongoUserId();
//   }, [user, isLoaded]);

//   // Fetch people belonging to this user
//   useEffect(() => {
//     if (!mongoId) return;

//     const fetchPeople = async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:5001/person?creator=${mongoId}`
//         );
//         if (!res.ok) throw new Error("Failed to fetch people");
//         const data = await res.json();
//         setPeople(data);
//         if (data.length > 0) setSelectedPerson(data[0]); // default to first person
//         console.log("People:", data);
//       } catch (err) {
//         console.error("Error fetching people", err);
//       }
//     };

//     fetchPeople();
//   }, [mongoId]);

//   // Helper: format full name including middle name and suffix
//   const getFullName = (person) => {
//     const parts = [
//       person.firstName,
//       person.middleName,
//       person.lastName,
//       person.suffix
//     ].filter(Boolean);
//     return parts.join(' ');
//   };

//   // Handle edit mode
//   const handleEdit = () => {
//     setEditFormData({
//       firstName: selectedPerson.firstName || "",
//       middleName: selectedPerson.middleName || "",
//       lastName: selectedPerson.lastName || "",
//       suffix: selectedPerson.suffix || "",
//       gender: selectedPerson.gender || "",
//       birth: selectedPerson.birth ? selectedPerson.birth.split('T')[0] : "",
//       death: selectedPerson.death ? selectedPerson.death.split('T')[0] : "",
//       parents: selectedPerson.parents || "",
//       spouseName: selectedPerson.spouseName || "",
//       children: selectedPerson.children || "",
//       biography: selectedPerson.biography || ""
//     });
//     setIsEditing(true);
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle save
//   const handleSave = async () => {
//     try {
//       const response = await fetch(`http://localhost:5001/person/${selectedPerson._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(editFormData)
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update person');
//       }

//       const updatedPerson = await response.json();
      
//       // Update the people array
//       setPeople(prev => prev.map(p => 
//         p._id === updatedPerson._id ? updatedPerson : p
//       ));
      
//       // Update selected person
//       setSelectedPerson(updatedPerson);
//       setIsEditing(false);
//       console.log('Person updated successfully:', updatedPerson);
//     } catch (error) {
//       console.error('Error updating person:', error);
//       alert('Failed to save changes. Please try again.');
//     }
//   };

//   // Handle cancel
//   const handleCancel = () => {
//     setIsEditing(false);
//     setEditFormData({});
//   };

//   // Styles
//   const containerStyle = { display: "flex", height: "100vh" };
//   const profileStyle = {
//     width: "75%",
//     padding: "24px",
//     borderRight: "1px solid #ccc",
//     overflowY: "auto",
//   };
//   const listStyle = {
//     width: "25%",
//     padding: "16px",
//     borderLeft: "1px solid #ccc",
//     overflowY: "auto",
//   };
//   const profileImgStyle = {
//     width: "200px",
//     height: "200px",
//     objectFit: "cover",
//     borderRadius: "8px",
//     marginBottom: "16px",
//   };
//   const listItemStyle = (isSelected) => ({
//     cursor: "pointer",
//     padding: "8px",
//     borderRadius: "4px",
//     backgroundColor: isSelected ? "#d3d3d3" : "transparent",
//     marginBottom: "4px",
//   });
//   const hoverStyle = { backgroundColor: "#e0e0e0" };
//   const fieldStyle = { marginBottom: "12px", lineHeight: "1.5" };
//   const inputStyle = { 
//     width: "100%", 
//     padding: "6px", 
//     border: "1px solid #ccc", 
//     borderRadius: "4px",
//     fontSize: "14px"
//   };
//   const buttonStyle = {
//     padding: "8px 16px",
//     margin: "4px",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     fontSize: "14px"
//   };
//   const editButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: "#007bff",
//     color: "white"
//   };
//   const saveButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: "#28a745",
//     color: "white"
//   };
//   const cancelButtonStyle = {
//     ...buttonStyle,
//     backgroundColor: "#6c757d",
//     color: "white"
//   };

//   return (
//     <div style={containerStyle}>
//       {/* Left side profile card */}
//       <div style={profileStyle}>
//         {selectedPerson ? (
//           <>
//             <img
//               src={selectedPerson.photoArray?.[0]}
//               alt="profile"
//               style={profileImgStyle}
//             />
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
//               <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
//                 {isEditing ? getFullName(editFormData) : getFullName(selectedPerson)}
//               </h2>
//               {!isEditing && (
//                 <button onClick={handleEdit} style={editButtonStyle}>
//                   Edit
//                 </button>
//               )}
//             </div>

//             {/* Save/Cancel buttons (only show when editing) */}
//             {isEditing && (
//               <div style={{ marginBottom: "20px" }}>
//                 <button onClick={handleSave} style={saveButtonStyle}>
//                   Save
//                 </button>
//                 <button onClick={handleCancel} style={cancelButtonStyle}>
//                   Cancel
//                 </button>
//               </div>
//             )}
            
//             <div style={fieldStyle}>
//               <strong>First Name:</strong> {
//                 isEditing ? (
//                   <input
//                     type="text"
//                     name="firstName"
//                     value={editFormData.firstName}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.firstName || "N/A"
//                 )
//               }
//             </div>
            
//             <div style={fieldStyle}>
//               <strong>Middle Name:</strong> {
//                 isEditing ? (
//                   <input
//                     type="text"
//                     name="middleName"
//                     value={editFormData.middleName}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.middleName || "N/A"
//                 )
//               }
//             </div>
            
//             <div style={fieldStyle}>
//               <strong>Last Name:</strong> {
//                 isEditing ? (
//                   <input
//                     type="text"
//                     name="lastName"
//                     value={editFormData.lastName}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.lastName || "N/A"
//                 )
//               }
//             </div>
            
//             <div style={fieldStyle}>
//               <strong>Suffix:</strong> {
//                 isEditing ? (
//                   <input
//                     type="text"
//                     name="suffix"
//                     value={editFormData.suffix}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.suffix || "N/A"
//                 )
//               }
//             </div>
            
//             <div style={fieldStyle}>
//               <strong>Gender:</strong> {
//                 isEditing ? (
//                   <select
//                     name="gender"
//                     value={editFormData.gender}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   >
//                     <option value="">Select...</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 ) : (
//                   selectedPerson.gender || "N/A"
//                 )
//               }
//             </div>
            
//             <div style={fieldStyle}>
//               <strong>Birth Date:</strong> {
//                 isEditing ? (
//                   <input
//                     type="date"
//                     name="birth"
//                     value={editFormData.birth}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.birth ? new Date(selectedPerson.birth).toLocaleDateString() : "N/A"
//                 )
//               }
//             </div>
            
//             <div style={fieldStyle}>
//               <strong>Death Date:</strong> {
//                 isEditing ? (
//                   <input
//                     type="date"
//                     name="death"
//                     value={editFormData.death}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.death ? new Date(selectedPerson.death).toLocaleDateString() : "N/A"
//                 )
//               }
//             </div>

//             <div style={fieldStyle}>
//               <strong>Parents:</strong> {
//                 isEditing ? (
//                   <input
//                     type="text"
//                     name="parents"
//                     value={editFormData.parents}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.parents || "N/A"
//                 )
//               }
//             </div>

//             <div style={fieldStyle}>
//               <strong>Spouse:</strong> {
//                 isEditing ? (
//                   <input
//                     type="text"
//                     name="spouseName"
//                     value={editFormData.spouseName}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.spouseName || "N/A"
//                 )
//               }
//             </div>

//             <div style={fieldStyle}>
//               <strong>Children:</strong> {
//                 isEditing ? (
//                   <input
//                     type="text"
//                     name="children"
//                     value={editFormData.children}
//                     onChange={handleInputChange}
//                     style={inputStyle}
//                   />
//                 ) : (
//                   selectedPerson.children || "N/A"
//                 )
//               }
//             </div>
            
//             <div style={fieldStyle}>
//               <strong>Bio:</strong> {
//                 isEditing ? (
//                   <textarea
//                     name="biography"
//                     value={editFormData.biography}
//                     onChange={handleInputChange}
//                     style={{...inputStyle, height: "80px"}}
//                     rows={4}
//                   />
//                 ) : (
//                   selectedPerson.biography || "No bio available"
//                 )
//               }
//             </div>
//           </>
//         ) : (
//           <div style={{ color: "#888" }}>Select a person from the list</div>
//         )}
//       </div>

//       {/* Right side people list */}
//       <div style={listStyle}>
//         <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>All People</h3>
//         <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
//           {people.map((p) => (
//             <li
//               key={p._id}
//               onClick={() => setSelectedPerson(p)}
//               style={listItemStyle(selectedPerson?._id === p._id)}
//               onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor)}
//               onMouseOut={(e) => (e.currentTarget.style.backgroundColor = selectedPerson?._id === p._id ? "#d3d3d3" : "transparent")}
//             >
//               {getFullName(p)}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default MyPeople;

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import "../components/myPeople/MyPeople.css";
import Header from "../components/header/Header";

const MyPeople = () => {
  const { user, isLoaded } = useUser();

  const [mongoId, setMongoId] = useState(null);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Fetch mongo user id
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchMongoUserId = async () => {
      try {
        const res = await fetch(`http://localhost:5001/user/${user.id}`);
        if (!res.ok) throw new Error("User not found in Mongo");
        const data = await res.json();
        setMongoId(data._id);
      } catch (err) {
        console.error("Error fetching mongoId", err);
      }
    };

    fetchMongoUserId();
  }, [user, isLoaded]);

  // Fetch people belonging to this user
  useEffect(() => {
    if (!mongoId) return;

    const fetchPeople = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/person?creator=${mongoId}`
        );
        if (!res.ok) throw new Error("Failed to fetch people");
        const data = await res.json();
        setPeople(data);
        if (data.length > 0) setSelectedPerson(data[0]);
      } catch (err) {
        console.error("Error fetching people", err);
      }
    };

    fetchPeople();
  }, [mongoId]);

  const getFullName = (person) => {
    const parts = [
      person.firstName,
      person.middleName,
      person.lastName,
      person.suffix,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const handleEdit = () => {
    setEditFormData({
      firstName: selectedPerson.firstName || "",
      middleName: selectedPerson.middleName || "",
      lastName: selectedPerson.lastName || "",
      suffix: selectedPerson.suffix || "",
      gender: selectedPerson.gender || "",
      birth: selectedPerson.birth ? selectedPerson.birth.split("T")[0] : "",
      death: selectedPerson.death ? selectedPerson.death.split("T")[0] : "",
      parents: selectedPerson.parents || "",
      spouseName: selectedPerson.spouseName || "",
      children: selectedPerson.children || "",
      biography: selectedPerson.biography || "",
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/person/${selectedPerson._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );
      if (!response.ok) throw new Error("Failed to update person");

      const updatedPerson = await response.json();
      setPeople((prev) =>
        prev.map((p) => (p._id === updatedPerson._id ? updatedPerson : p))
      );
      setSelectedPerson(updatedPerson);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating person:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData({});
  };

  return (
    <>
    <Header/>
    <div className="page-container">
      <div className="form-card">
        <h2 className="page-title">My People</h2>

        {selectedPerson ? (
          <>
            <img
              src={selectedPerson.photoArray?.[0]}
              alt="profile"
              className="profile-img"
            />

            <div className="field-container">
              <h3 className="field-label">
                {isEditing
                  ? getFullName(editFormData)
                  : getFullName(selectedPerson)}
              </h3>
            </div>

            {!isEditing && (
              <button className="btn-primary" onClick={handleEdit}>
                Edit
              </button>
            )}

            {isEditing && (
              <div className="button-row">
                <button className="btn-primary" onClick={handleSave}>
                  Save
                </button>
                <button className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}

            {[
              { label: "First Name", name: "firstName", type: "text" },
              { label: "Middle Name", name: "middleName", type: "text" },
              { label: "Last Name", name: "lastName", type: "text" },
              { label: "Suffix", name: "suffix", type: "text" },
              {
                label: "Gender",
                name: "gender",
                type: "select",
                options: ["", "male", "female", "other"],
              },
              { label: "Birth Date", name: "birth", type: "date" },
              { label: "Death Date", name: "death", type: "date" },
              { label: "Parents", name: "parents", type: "text" },
              { label: "Spouse", name: "spouseName", type: "text" },
              { label: "Children", name: "children", type: "text" },
              { label: "Bio", name: "biography", type: "textarea" },
            ].map((field) => (
              <div className="field-container" key={field.name}>
                <label className="field-label">{field.label}:</label>
                {isEditing ? (
                  field.type === "select" ? (
                    <select
                      name={field.name}
                      value={editFormData[field.name]}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt || "Select..."}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={editFormData[field.name]}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={editFormData[field.name]}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  )
                ) : (
                  <div className="field-value">
                    {selectedPerson[field.name] || "N/A"}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="field-value">Select a person from the list</div>
        )}
      </div>

      <div className="form-card">
        <h3 className="page-subtitle">All People</h3>
        <ul className="people-list">
          {people.map((p) => (
            <li
              key={p._id}
              onClick={() => setSelectedPerson(p)}
              className={
                selectedPerson?._id === p._id ? "btn-link-active" : ""
              }
            >
              {getFullName(p)}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
};

export default MyPeople;
