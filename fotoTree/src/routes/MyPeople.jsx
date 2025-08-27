import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const MyPeople = () => {
  const { user, isLoaded } = useUser();

  const [mongoId, setMongoId] = useState(null);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [newFile, setNewFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // Loading state for save operation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Delete confirmation dialog
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete operation

  // Fetch mongo user id
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchMongoUserId = async () => {
      try {
        const res = await fetch(`http://localhost:5001/user/${user.id}`);
        if (!res.ok) throw new Error("User not found in Mongo");
        const data = await res.json();
        setMongoId(data._id);
        console.log("Mongo user ID:", data._id);
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
        console.log("People:", data);
      } catch (err) {
        console.error("Error fetching people", err);
      }
    };

    fetchPeople();
  }, [mongoId]);

  // Helper: format full name including middle name and suffix
  const getFullName = (person) => {
    const parts = [
      person.firstName,
      person.middleName,
      person.lastName,
      person.suffix,
    ].filter(Boolean);
    return parts.join(" ");
  };

  // Handle edit mode
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
      photoArray: selectedPerson.photoArray || [],
    });
    setNewFile(null);
    setIsEditing(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle photo selection
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
    }
  };

  // Handle save - includes photo upload if needed
  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updatedPhotoArray = editFormData.photoArray || [];

      // If we have a new file, upload it first
      if (newFile) {
        console.log("Uploading new file:", newFile.name);
        
        // Delete old photo if exists
        if (selectedPerson.photoArray?.length > 0) {
          const oldPhotoUrl = selectedPerson.photoArray[0];
          console.log("Deleting old photo:", oldPhotoUrl);
          await fetch(
            `http://localhost:5001/person/${selectedPerson._id}/photo/${encodeURIComponent(
              oldPhotoUrl
            )}`,
            { method: "DELETE" }
          );
        }

        // Upload new photo to Cloudinary
        const formData = new FormData();
        formData.append("file", newFile);

        const uploadRes = await fetch("http://localhost:5001/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error("Upload failed:", uploadRes.status, errorText);
          throw new Error("Photo upload failed");
        }
        
        const uploadResult = await uploadRes.json();
        console.log("Upload response:", uploadResult);
        
        // The server returns the saved image document with imageUrl property
        const imageUrl = uploadResult.imageUrl;
        console.log("Setting photoArray to:", [imageUrl]);
        updatedPhotoArray = [imageUrl];
      }

      // Send PUT request with updated form data
      const putData = { ...editFormData, photoArray: updatedPhotoArray };
      console.log("Sending PUT request with data:", putData);
      
      const response = await fetch(
        `http://localhost:5001/person/${selectedPerson._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(putData),
        }
      );

      if (!response.ok) throw new Error("Failed to update person");
      const updatedPerson = await response.json();

      setPeople((prev) =>
        prev.map((p) => (p._id === updatedPerson._id ? updatedPerson : p))
      );
      setSelectedPerson(updatedPerson);
      setIsEditing(false);
      setNewFile(null);
      console.log("Person updated successfully:", updatedPerson);
    } catch (error) {
      console.error("Error updating person:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData({});
    setNewFile(null);
  };

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation cancel
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Handle delete person
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // First delete photo if it exists
      if (selectedPerson.photoArray?.length > 0) {
        const photoUrl = selectedPerson.photoArray[0];
        console.log("Deleting photo:", photoUrl);
        
        const photoDeleteRes = await fetch(
          `http://localhost:5001/person/${selectedPerson._id}/photo/${encodeURIComponent(photoUrl)}`,
          { method: "DELETE" }
        );
        
        if (!photoDeleteRes.ok) {
          console.warn("Failed to delete photo, continuing with person deletion");
        }
      }

      // Delete the person
      const personDeleteRes = await fetch(
        `http://localhost:5001/person/${selectedPerson._id}`,
        { method: "DELETE" }
      );

      if (!personDeleteRes.ok) throw new Error("Failed to delete person");

      // Update local state
      setPeople(prev => prev.filter(p => p._id !== selectedPerson._id));
      
      // Select next person or clear selection
      const remainingPeople = people.filter(p => p._id !== selectedPerson._id);
      setSelectedPerson(remainingPeople.length > 0 ? remainingPeople[0] : null);
      
      setShowDeleteConfirm(false);
      console.log("Person deleted successfully");
      alert("Person deleted successfully");
      
    } catch (error) {
      console.error("Error deleting person:", error);
      alert("Failed to delete person. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get current display image
  const getCurrentDisplayImage = () => {
    if (newFile) return URL.createObjectURL(newFile);
    return editFormData.photoArray?.[0];
  };

  // --- Styles ---
  const containerStyle = { display: "flex", height: "100vh" };
  const profileStyle = {
    width: "75%",
    padding: "24px",
    borderRight: "1px solid #ccc",
    overflowY: "auto",
    position: "relative",
    textAlign: "center",
  };
  const listStyle = {
    width: "25%",
    padding: "16px",
    borderLeft: "1px solid #ccc",
    overflowY: "auto",
  };
  const profileImgStyle = {
    width: "200px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px",
    margin: "16px auto",
    display: "block",
  };
  const listItemStyle = (isSelected) => ({
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    backgroundColor: isSelected ? "#d3d3d3" : "transparent",
    marginBottom: "4px",
  });
  const hoverStyle = { backgroundColor: "#e0e0e0" };
  const fieldsGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 42px 1fr",
    alignItems: "center",
    rowGap: "12px",
    width: "100%",
    maxWidth: "720px",
    margin: "0 auto",
  };
  const labelCellStyle = {
    gridColumn: "1",
    textAlign: "right",
    fontWeight: "bold",
  };
  const valueCellStyle = {
    gridColumn: "3",
    textAlign: "left",
  };
  const inputStyle = {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "18px",
  };
  const buttonStyle = {
    padding: "6px 12px",
    margin: "4px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "18px",
  };
  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white",
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "14px",
    padding: "4px 10px",
  };
  const saveButtonStyle = { 
    ...buttonStyle, 
    backgroundColor: isSaving ? "#6c757d" : "#28a745", 
    color: "white",
    cursor: isSaving ? "not-allowed" : "pointer"
  };
  const cancelButtonStyle = { ...buttonStyle, backgroundColor: "#6c757d", color: "white" };
  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white",
    position: "absolute",
    top: "10px",
    right: "60px", // Position to the left of edit button
    fontSize: "14px",
    padding: "4px 10px",
  };
  const confirmDeleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDeleting ? "#6c757d" : "#dc3545",
    color: "white",
    cursor: isDeleting ? "not-allowed" : "pointer"
  };
  const cancelDeleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
    color: "white",
    cursor: isDeleting ? "not-allowed" : "pointer",
    opacity: isDeleting ? 0.6 : 1
  };
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };
  const modalContentStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
  };

  return (
    <div style={containerStyle}>
      {/* Left side profile card */}
      <div style={profileStyle}>
        {selectedPerson ? (
          <>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px" }}>
              {isEditing ? getFullName(editFormData) : getFullName(selectedPerson)}
            </h2>
            {!isEditing && (
              <>
                <button onClick={handleEdit} style={editButtonStyle}>
                  Edit
                </button>
                <button onClick={handleDeleteClick} style={deleteButtonStyle}>
                  🗑️
                </button>
              </>
            )}
            <img
              src={isEditing ? getCurrentDisplayImage() : selectedPerson.photoArray?.[0]}
              alt="profile"
              style={profileImgStyle}
            />
            
            {/* Photo upload input */}
            {isEditing && (
              <div style={{ marginBottom: "16px" }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                />
                {newFile && (
                  <div style={{ 
                    color: "#007bff", 
                    fontSize: "14px", 
                    marginTop: "8px",
                    fontStyle: "italic"
                  }}>
                    New photo selected: {newFile.name}
                  </div>
                )}
              </div>
            )}
            
            {/* Save/Cancel buttons */}
            {isEditing && (
              <div style={{ marginBottom: "20px" }}>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  style={saveButtonStyle}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    ...cancelButtonStyle,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    opacity: isSaving ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* Fields grid */}
            <div style={fieldsGridStyle}>
              <div style={labelCellStyle}>First Name:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="text" name="firstName" value={editFormData.firstName} onChange={handleInputChange} style={inputStyle} />
                ) : (
                  selectedPerson.firstName || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Middle Name:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="text" name="middleName" value={editFormData.middleName} onChange={handleInputChange} style={inputStyle} />
                ) : (
                  selectedPerson.middleName || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Last Name:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="text" name="lastName" value={editFormData.lastName} onChange={handleInputChange} style={inputStyle} />
                ) : (
                  selectedPerson.lastName || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Suffix:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="text" name="suffix" value={editFormData.suffix} onChange={handleInputChange} style={inputStyle} />
                ) : (
                  selectedPerson.suffix || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Gender:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <select name="gender" value={editFormData.gender} onChange={handleInputChange} style={inputStyle}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  selectedPerson.gender || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Birth Date:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="date" name="birth" value={editFormData.birth} onChange={handleInputChange} style={inputStyle} />
                ) : selectedPerson.birth ? (
                  new Date(selectedPerson.birth).toLocaleDateString()
                ) : (
                  "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Death Date:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="date" name="death" value={editFormData.death} onChange={handleInputChange} style={inputStyle} />
                ) : selectedPerson.death ? (
                  new Date(selectedPerson.death).toLocaleDateString()
                ) : (
                  "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Parents:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="text" name="parents" value={editFormData.parents} onChange={handleInputChange} style={inputStyle} />
                ) : (
                  selectedPerson.parents || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Spouse:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="text" name="spouseName" value={editFormData.spouseName} onChange={handleInputChange} style={inputStyle} />
                ) : (
                  selectedPerson.spouseName || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Children:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <input type="text" name="children" value={editFormData.children} onChange={handleInputChange} style={inputStyle} />
                ) : (
                  selectedPerson.children || "N/A"
                )}
              </div>
              <div style={labelCellStyle}>Bio:</div>
              <div style={valueCellStyle}>
                {isEditing ? (
                  <textarea name="biography" value={editFormData.biography} onChange={handleInputChange} style={{ ...inputStyle, height: "80px" }} rows={4} />
                ) : (
                  selectedPerson.biography || "No bio available"
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: "#888" }}>Select a person from the list</div>
        )}
      </div>

      {/* Right side people list */}
      <div style={listStyle}>
        <h3 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "8px" }}>All People</h3>
        <hr />
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {people.map((p) => (
            <li
              key={p._id}
              onClick={() => setSelectedPerson(p)}
              style={listItemStyle(selectedPerson?._id === p._id)}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selectedPerson?._id === p._id ? "#d3d3d3" : "transparent")
              }
            >
              {getFullName(p)}
            </li>
          ))}
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginBottom: "16px", color: "#dc3545" }}>Delete Person</h3>
            <p style={{ marginBottom: "24px", lineHeight: "1.5" }}>
              Are you sure you want to delete this person? This will delete all data and cannot be reversed.
            </p>
            <div>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={confirmDeleteButtonStyle}
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
              <button 
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                style={cancelDeleteButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPeople;