import { useEffect, useState } from "react";

const PersonDropdown = ({ mongoId }) => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!mongoId) return; // don’t fetch without a creator ID

    const fetchPeople = async () => {
      try {
        const res = await fetch(`http://localhost:5000/person?creator=${mongoId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch people");
        }
        const data = await res.json();
        setPeople(data);
      } catch (err) {
        console.error("Error fetching people:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [mongoId]);

  if (loading) return <p>Loading people…</p>;

  return (
    <select
      className="nodrag"
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
    >
      <option value="">Select a person</option>
      {people.map((p) => (
        <option key={p._id} value={p._id}>
          {p.firstName} {p.lastName}
        </option>
      ))}
    </select>
  );
};

export default PersonDropdown;
