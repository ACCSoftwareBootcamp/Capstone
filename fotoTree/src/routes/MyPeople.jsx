import React, { useState, useEffect } from "react";
import "../components/MyPeople/MyPeople.css";

const MyPeople = ({ user }) => {
  const [mongoId, setMongoId] = useState(null);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Fetch mongo user id first
  useEffect(() => {
    if (!user?.id) return;
    const fetchMongoUserId = async () => {
      try {
        const res = await fetch(`http://localhost:5000/user/${user.id}`);
        const data = await res.json();
        setMongoId(data._id);
      } catch (err) {
        console.error("Error fetching mongoId", err);
      }
    };
    fetchMongoUserId();
  }, [user]);

  // Fetch people belonging to this user
  useEffect(() => {
    if (!mongoId) return;
    const fetchPeople = async () => {
      try {
        const res = await fetch(`http://localhost:5000/person?creator=${mongoId}`);
        if (!res.ok) throw new Error("Failed to fetch people");
        const data = await res.json();
        setPeople(data);
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

  return (
    <div className="myp-container">
      {/* Left side profile card */}
      <div className="profile-card">
        {selectedPerson ? (
          <>
            <img
              src="https://via.placeholder.com/150"
              alt="profile"
              className="profile-img"
            />
            <h2>
              {selectedPerson.firstName} {selectedPerson.lastName}
            </h2>
            <p><strong>Birth Date:</strong> {selectedPerson.birthDate || "N/A"}</p>
            <p><strong>Death Date:</strong> {selectedPerson.deathDate || "N/A"}</p>
            <p><strong>Gender:</strong> {selectedPerson.gender || "N/A"}</p>
            <p><strong>Bio:</strong> {selectedPerson.bio || "No bio available"}</p>

            {selectedPerson.spouse && (
              <p><strong>Spouse:</strong> {getNameById(selectedPerson.spouse)}</p>
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
          <div className="empty-card">Select a person from the list</div>
        )}
      </div>

      {/* Right side people list */}
      <div className="people-list">
        <h3>All People</h3>
        <ul>
          {people.map((p) => (
            <li
              key={p._id}
              onClick={() => setSelectedPerson(p)}
              className={selectedPerson?._id === p._id ? "active" : ""}
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
