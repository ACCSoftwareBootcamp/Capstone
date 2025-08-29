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
            `http://localhost:5001/person/${
              selectedPerson._id
            }/photo/${encodeURIComponent(photoUrl)}`,
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
      <Header />
      <div className="page-container">
        <div className="profile-section">
          {selectedPerson ? (
            <>
              <h2 className="page-title">
                {isEditing
                  ? getFullName(editFormData)
                  : getFullName(selectedPerson)}
              </h2>

              {!isEditing && (
                <>
                  <button onClick={handleEdit} className="button btn-edit">
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="button btn-delete"
                  >
                    🗑️
                  </button>
                </>
              )}

              <div className="profile-img-wrapper">
                {currentPhoto ? (
                  <>
                    <img
                      src={currentPhoto}
                      alt="profile"
                      className="profile-img"
                    />
                    {displayedPhotos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevPhoto}
                          className="arrow-button left"
                        >
                          ◀
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className="arrow-button right"
                        >
                          ▶
                        </button>
                      </>
                    )}
                    {isEditing && (
                      <button
                        onClick={() => handleDeletePhoto(currentPhoto)}
                        className="delete-photo-btn"
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
                {displayedPhotos.length > 1 && (
                  <div style={{ marginTop: "8px", fontSize: "14px" }}>
                    {currentPhotoIndex + 1} of {displayedPhotos.length}
                  </div>
                )}
              </div>

              {isEditing && photosToDelete.length > 0 && (
                <div className="photos-to-delete">
                  <div>Photos marked for deletion:</div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {photosToDelete.map((photoUrl, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={photoUrl}
                          alt="To delete"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "2px solid #dc3545",
                            opacity: 0.7,
                          }}
                        />
                        <button
                          onClick={() => {
                            setPhotosToDelete((prev) =>
                              prev.filter((url) => url !== photoUrl)
                            );
                            setEditFormData((prev) => ({
                              ...prev,
                              photoArray: [...prev.photoArray, photoUrl],
                            }));
                          }}
                          className="restore-btn"
                        >
                          ↶
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEditing && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {newFile && <p>New photo selected: {newFile.name}</p>}
                </div>
              )}

              {isEditing && (
                <div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`button btn-save ${
                      isSaving ? "btn-disabled" : ""
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className={`button btn-cancel ${
                      isSaving ? "btn-disabled" : ""
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="fields-grid">
                {[
                  ["First Name", "firstName"],
                  ["Middle Name", "middleName"],
                  ["Last Name", "lastName"],
                  ["Suffix", "suffix"],
                  ["Gender", "gender"],
                  ["Birth", "birth", "date"],
                  ["Death", "death", "date"],
                  ["Parents", "parents"],
                  ["Spouse", "spouseName"],
                  ["Children", "children"],
                  ["Biography", "biography", "textarea"],
                ].map(([label, field, type]) => (
                  <React.Fragment key={field}>
                    <div className="field-label">{label}:</div>
                    <div className="field-value">
                      {isEditing ? (
                        type === "textarea" ? (
                          <textarea
                            name={field}
                            value={editFormData[field]}
                            onChange={handleInputChange}
                            rows={4}
                            className="input-field"
                          />
                        ) : (
                          <input
                            type={type || "text"}
                            name={field}
                            value={editFormData[field]}
                            onChange={handleInputChange}
                            className="input-field"
                          />
                        )
                      ) : (
                        selectedPerson[field] ||
                        (type === "date" && selectedPerson[field]
                          ? new Date(selectedPerson[field]).toLocaleDateString()
                          : "N/A")
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </>
          ) : (
            <p>No person selected</p>
          )}
        </div>

        <div className="people-section">
          <h3>People</h3>
          <ul className="people-list">
            {people.map((person) => (
              <li
                key={person._id}
                className={selectedPerson?._id === person._id ? "active" : ""}
                onClick={() => setSelectedPerson(person)}
              >
                {getFullName(person)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 className="confirm-delete">Confirm Delete</h3>
            <p className="confirm-delete">
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
                {isDeleting ? "Deleting..." : "Yes, Delete"}{" "}
              </button>{" "}
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                style={cancelDeleteButtonStyle}
              >
                {" "}
                Cancel{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      <Footer />
    </>
  );
};

export default MyPeople;
