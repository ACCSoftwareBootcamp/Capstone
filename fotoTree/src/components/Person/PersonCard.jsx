import React, { useState } from "react";
import "./PersonCard.css";

function PersonCard({ fullName, birth, death, gender, biography }) {
  const [photoUrl, setPhotoUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setPhotoUrl(newImageUrl);
    }
  };

  return (
    <div className="person-card">
      <input type="file" accept="image/*" onChange={handleImageChange} />

      <img
        src={photoUrl || "https://via.placeholder.com/150"}
        alt={fullName}
        className="person-photo"
      />

      <div className="person-info">
        <h2>{fullName}</h2>
        <p>
          <strong>Birth Date:</strong> {birth}
        </p>
        {death && (
          <p>
            <strong>Death Date:</strong> {death}
          </p>
        )}
        <p>
          <strong>Gender:</strong> {gender}
        </p>
        {biography && (
          <p>
            <strong>Biography:</strong> {biography}
          </p>
        )}
      </div>
    </div>
  );
}

export default PersonCard;
