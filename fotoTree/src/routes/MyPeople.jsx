import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

const MyPeople = () => {
  const { user, isLoaded } = useUser(); // must be inside component

  const [mongoId, setMongoId] = useState(null);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

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
        if (data.length > 0) setSelectedPerson(data[0]); // default to first person
        console.log("People:", data);
      } catch (err) {
        console.error("Error fetching people", err);
      }
    };

    fetchPeople();
  }, [mongoId]);

  // Helper: find full name from _id
  const getNameById = (id) => {
    const p = people.find((person) => person._id === id);
    return p ? `${p.firstName} ${p.lastName}` : "Unknown";
  };

  // Helper: find children (where this person’s _id appears in parents array)
  const getChildren = (id) => {
    return people.filter((p) => p.parents?.includes(id));
  };

  // Styles
  const containerStyle = { display: "flex", height: "100vh" };
  const profileStyle = {
    width: "75%",
    padding: "24px",
    borderRight: "1px solid #ccc",
    overflowY: "auto",
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
    marginBottom: "16px",
  };
  const listItemStyle = (isSelected) => ({
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    backgroundColor: isSelected ? "#d3d3d3" : "transparent",
    marginBottom: "4px",
  });
  const hoverStyle = { backgroundColor: "#e0e0e0" };

  return (
    <div style={containerStyle}>
      {/* Left side profile card */}
      <div style={profileStyle}>
        {selectedPerson ? (
          <>
            <img
              src={selectedPerson.photoArray?.[0]}
              alt="profile"
              style={profileImgStyle}
            />
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
              {selectedPerson.firstName} {selectedPerson.lastName}
            </h2>
            <p>
              <strong>Birth Date:</strong> {selectedPerson.birthDate || "N/A"}
            </p>
            <p>
              <strong>Death Date:</strong> {selectedPerson.deathDate || "N/A"}
            </p>
            <p>
              <strong>Gender:</strong> {selectedPerson.gender || "N/A"}
            </p>
            <p>
              <strong>Bio:</strong> {selectedPerson.bio || "No bio available"}
            </p>

            {selectedPerson.spouse && (
              <p>
                <strong>Spouse:</strong> {getNameById(selectedPerson.spouse)}
              </p>
            )}

            {selectedPerson.parents?.length > 0 && (
              <p>
                <strong>Parents:</strong>{" "}
                {selectedPerson.parents.map((id) => getNameById(id)).join(", ")}
              </p>
            )}

            {getChildren(selectedPerson._id).length > 0 && (
              <p>
                <strong>Children:</strong>{" "}
                {getChildren(selectedPerson._id)
                  .map((child) => `${child.firstName} ${child.lastName}`)
                  .join(", ")}
              </p>
            )}
          </>
        ) : (
          <div style={{ color: "#888" }}>Select a person from the list</div>
        )}
      </div>

      {/* Right side people list */}
      <div style={listStyle}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>All People</h3>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {people.map((p) => (
            <li
              key={p._id}
              onClick={() => setSelectedPerson(p)}
              style={listItemStyle(selectedPerson?._id === p._id)}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = selectedPerson?._id === p._id ? "#d3d3d3" : "transparent")}
            >
              {p.firstName} {p.lastName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyPeople;
