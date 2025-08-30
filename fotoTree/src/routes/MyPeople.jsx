import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import "../components/MyPeople/MyPeople.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

const MyPeople = () => {
  const { user, isLoaded } = useUser();

  const [mongoId, setMongoId] = useState(null);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [newFile, setNewFile] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); //  track which photo is showing
  const [isSaving, setIsSaving] = useState(false); // Loading state for save operation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Delete confirmation 
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete operation  
  const [photosToDelete, setPhotosToDelete] = useState([]); // track deleted photos


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

  // Reset photo index when changing person
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [selectedPerson]);

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
      photoArray: selectedPerson.photoArray || [],
    });
    setNewFile(null);
    setIsEditing(true);
  };

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
  // Handle save - includes photo upload if needed
const handleSave = async () => {
  setIsSaving(true);
  try {
    let updatedPhotoArray = [...(editFormData.photoArray || [])];

    // If we have a new file, upload it first
    if (newFile) {
      console.log("Uploading new file:", newFile.name);

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
      const imageUrl = uploadResult.imageUrl;

      updatedPhotoArray.push(imageUrl); // 👈 append new photo
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

    // --- new: send DELETE requests for photos marked for deletion ---
    for (const photoUrl of photosToDelete) {
      try {
        await fetch(
          `http://localhost:5001/person/${selectedPerson._id}/photo/${encodeURIComponent(
            photoUrl
          )}`,
          { method: "DELETE" }
        );
      } catch (err) {
        console.error("Error deleting photo:", err);
      }
    }
    setPhotosToDelete([]); // clear queue after save

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



  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  //HandleCancel editing
  // Cancel editing and restore original data
const handleCancel = () => {
  setIsEditing(false);
  setEditFormData(selectedPerson); // revert edits
  setNewFile(null);
  setPhotosToDelete([]); // clear any queued deletions
};


  // Handle delete person
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const personDeleteRes = await fetch(
        `http://localhost:5001/person/${selectedPerson._id}`,
        { method: "DELETE" }
      );

      if (!personDeleteRes.ok) throw new Error("Failed to delete person");

      setPeople((prev) => prev.filter((p) => p._id !== selectedPerson._id));
      const remainingPeople = people.filter(
        (p) => p._id !== selectedPerson._id
      );
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

// Handle photo deletion in edit mode
const handleDeletePhoto = (photoUrl) => {
  // Instead of deleting immediately, mark it for deletion on save
  setPhotosToDelete((prev) => [...prev, photoUrl]);

  setEditFormData((prev) => ({
    ...prev,
    photoArray: prev.photoArray.filter((p) => p !== photoUrl),
  }));
  setCurrentPhotoIndex(0);
};

  // Photo navigation
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev > 0 ? prev - 1 : (getDisplayedPhotos().length || 1) - 1
    );
  };
  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev < (getDisplayedPhotos().length || 1) - 1 ? prev + 1 : 0
    );
  };

  const getDisplayedPhotos = () =>
    isEditing ? editFormData.photoArray : selectedPerson?.photoArray || [];

  const displayedPhotos = getDisplayedPhotos();
  const currentPhoto = displayedPhotos[currentPhotoIndex];

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
  const profileImgWrapper = {
    position: "relative",
    margin: "16px auto",
    width: "220px",
  };
  const profileImgStyle = {
    width: "200px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px",
    display: "block",
    margin: "0 auto",
  };
  const arrowButtonStyle = (side) => ({
    position: "absolute",
    top: "50%",
    [side]: "-30px",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  });
  const deletePhotoButtonStyle = {
    position: "absolute",
    top: "-10px",
    right: "-10px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
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
    cursor: isSaving ? "not-allowed" : "pointer",
  };
  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
    color: "white",
  };
  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white",
    position: "absolute",
    top: "10px",
    right: "60px",
    fontSize: "14px",
    padding: "4px 10px",
  };
  const confirmDeleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDeleting ? "#6c757d" : "#dc3545",
    color: "white",
    cursor: isDeleting ? "not-allowed" : "pointer",
  };
  const cancelDeleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
    color: "white",
    cursor: isDeleting ? "not-allowed" : "pointer",
    opacity: isDeleting ? 0.6 : 1,
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
    zIndex: 1000,
  };
  const modalContentStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  };

  return (
    <>
      <div style={containerStyle}>
        {/* Left side profile card */}
        <div style={profileStyle}>
          {selectedPerson ? (
            <>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "0 0 8px",
                }}
              >
                {isEditing
                  ? getFullName(editFormData)
                  : getFullName(selectedPerson)}
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



{/* --- Enhanced Photo Viewer --- */}
<div style={profileImgWrapper}>
  {currentPhoto ? (
    <>
      <img
        src={currentPhoto}
        alt="profile"
        style={profileImgStyle}
      />
      {/* Show navigation arrows in both view and edit mode when multiple photos */}
      {displayedPhotos.length > 1 && (
        <>
          <button
            onClick={handlePrevPhoto}
            style={arrowButtonStyle("left")}
          >
            ◀
          </button>
          <button
            onClick={handleNextPhoto}
            style={arrowButtonStyle("right")}
          >
            ▶
          </button>
        </>
      )}
      {/* Delete button only in edit mode */}
      {isEditing && (
        <button
          onClick={() => handleDeletePhoto(currentPhoto)}
          style={deletePhotoButtonStyle}
        >
          ✕
        </button>
      )}
    </>
  ) : (
    <div style={{ fontStyle: "italic", color: "#666" }}>
      No photos available
    </div>
  )}
  
  {/* Photo counter when multiple photos exist */}
  {displayedPhotos.length > 1 && (
    <div style={{
      textAlign: "center",
      fontSize: "14px",
      color: "#666",
      marginTop: "8px"
    }}>
      {currentPhotoIndex + 1} of {displayedPhotos.length}
    </div>
  )}
</div>

{/* Preview thumbnails for photos marked for deletion */}
{isEditing && photosToDelete.length > 0 && (
  <div style={{
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "4px"
  }}>
    <div style={{
      fontSize: "14px",
      fontWeight: "bold",
      marginBottom: "8px",
      color: "#856404"
    }}>
      Photos marked for deletion:
    </div>
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      justifyContent: "center"
    }}>
      {photosToDelete.map((photoUrl, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            display: "inline-block"
          }}
        >
          <img
            src={photoUrl}
            alt="To be deleted"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "4px",
              border: "2px solid #dc3545",
              opacity: 0.7
            }}
          />
          <button
            onClick={() => {
              // Remove from deletion queue and add back to photos
              setPhotosToDelete(prev => prev.filter(url => url !== photoUrl));
              setEditFormData(prev => ({
                ...prev,
                photoArray: [...prev.photoArray, photoUrl]
              }));
            }}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ↶
          </button>
        </div>
      ))}
    </div>
    <div style={{
      fontSize: "12px",
      color: "#856404",
      marginTop: "8px",
      fontStyle: "italic",
      textAlign: "center"
    }}>
      Click ↶ to restore a photo, or Save to permanently delete
    </div>
  </div>
)}

              {/* Photo upload input with preview */}
              {isEditing && (
                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {newFile && (
                    <div style={{
                      marginTop: "12px",
                      padding: "12px",
                      backgroundColor: "#d4edda",
                      border: "1px solid #c3e6cb",
                      borderRadius: "4px"
                    }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        color: "#155724"
                      }}>
                        New photo to be added:
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "8px"
                      }}>
                        <div style={{
                          position: "relative",
                          display: "inline-block"
                        }}>
                          <img
                            src={URL.createObjectURL(newFile)}
                            alt="Preview"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "2px solid #28a745"
                            }}
                          />
                          <button
                            onClick={() => setNewFile(null)}
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "-8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#155724",
                        fontStyle: "italic",
                        textAlign: "center"
                      }}>
                        {newFile.name} • Click ✕ to remove
                      </div>
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
                      opacity: isSaving ? 0.6 : 1,
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
                    <input
                      type="text"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.firstName || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Middle Name:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="middleName"
                      value={editFormData.middleName}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.middleName || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Last Name:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.lastName || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Suffix:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="suffix"
                      value={editFormData.suffix}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.suffix || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Gender:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="gender"
                      value={editFormData.gender}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.gender || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Birth:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birth"
                      value={editFormData.birth}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : selectedPerson.birth ? (
                    new Date(selectedPerson.birth).toLocaleDateString()
                  ) : (
                    "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Death:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="date"
                      name="death"
                      value={editFormData.death}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : selectedPerson.death ? (
                    new Date(selectedPerson.death).toLocaleDateString()
                  ) : (
                    "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Parents:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="parents"
                      value={editFormData.parents}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.parents || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Spouse:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="spouseName"
                      value={editFormData.spouseName}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.spouseName || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Children:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="children"
                      value={editFormData.children}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  ) : (
                    selectedPerson.children || "N/A"
                  )}
                </div>
                <div style={labelCellStyle}>Biography:</div>
                <div style={valueCellStyle}>
                  {isEditing ? (
                    <textarea
                      name="biography"
                      value={editFormData.biography}
                      onChange={handleInputChange}
                      rows={4}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  ) : (
                    selectedPerson.biography || "N/A"
                  )}
                </div>
              </div>
            </>
          ) : (
            <p>No person selected</p>
          )}
        </div>

        {/* Right side people list */}
        <div style={listStyle}>
          <h3>People</h3>
          {people.map((person) => (
            <div
              key={person._id}
              style={listItemStyle(selectedPerson?._id === person._id)}
              onClick={() => setSelectedPerson(person)}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0e0e0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selectedPerson?._id === person._id ? "#d3d3d3" : "transparent")
              }
            >
              {getFullName(person)}
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{getFullName(selectedPerson)}</strong>? This action cannot
              be undone.
            </p>
            <div>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                style={confirmDeleteButtonStyle}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
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

      <Footer />
    </>
  );
};

export default MyPeople;
