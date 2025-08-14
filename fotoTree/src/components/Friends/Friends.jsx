// This component fetches and displays a list of family tree collaborators and friends
import React, { useState, useEffect } from "react";
import "./Friends.css";


const Friends = () => {
  // State to hold the list of collaborators
  const [collaborators, setCollaborators] = useState([]);
  // State to manage loading state
  const [loading, setLoading] = useState(true);
  // State to manage any errors that occur during the fetch
  const [error, setError] = useState(null);

  // Fetching collaborators data from an API endpoint
  useEffect(() => {
    // This is where you would replace with your actual API endpoint
    fetch("/api/collaborators")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      // Parse the JSON response and update the state
      .then((data) => {
        setCollaborators(data);
        setLoading(false);
      })
      // Catch any errors and update the error state
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setLoading(false);
      });
  }, []);
  // If loading, show a loading message; if there's an error, show the error message
  if (loading)
    return <div className="container mt-4">Loading collaborators...</div>;
  if (error)
    return <div className="container mt-4 text-danger">Error: {error}</div>;
  // Render the list of collaborators
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Family Tree Collaborators & Friends</h1>
      {collaborators.length === 0 ? (
        <p>No collaborators found.</p>
      ) : (
        <div className="list-group">
          {collaborators.map((person) => (
            <div
              key={person.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            > 
              <div>
                <h5>{person.name}</h5>
                <p className="mb-1">
                  <strong>Relation:</strong> {person.relation}
                </p>
                <p className="mb-0">
                  <strong>Role:</strong> {person.role} —{" "}
                  <small>Last active: {person.lastActive}</small>
                </p>
              </div>
              <span
              // This badge indicates the online status of the person
                className={`badge rounded-pill ${
                  person.status === "Online" ? "bg-success" : "bg-secondary"
                }`}
              >
                {person.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
