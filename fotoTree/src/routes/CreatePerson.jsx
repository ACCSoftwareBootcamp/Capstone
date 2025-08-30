import { useState, useEffect, useRef } from "react";
import "../components/addPersonForm/CreatePerson.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { useUser } from "@clerk/clerk-react";

const CreatePerson = () => {
  const { user, isLoaded } = useUser();
  const [treeId, setTreeId] = useState("");
  const [mongoUser, setMongoUser] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    parents: "",
    spouse: "",
    children: "",
    gender: "",
    birthDate: "",
    deathDate: "",
    partnerId: "",
    bio: "",
  });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchMongoUserAndTree = async () => {
      try {
        const userRes = await fetch(`http://localhost:5001/user/${user.id}`);
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setMongoUser(userData._id);

        const treeRes = await fetch(`http://localhost:5001/tree/${userData._id}`);
        if (!treeRes.ok) throw new Error("Failed to fetch tree");
        const treeData = await treeRes.json();
        setTreeId(treeData._id);
      } catch (err) {
        console.error("Error getting user or tree", err);
      }
    };

    fetchMongoUserAndTree();
  }, [isLoaded, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!treeId) return;

    let photoArray = [];
    if (file) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        const uploadRes = await fetch("http://localhost:5001/upload", {
          method: "POST",
          body: uploadFormData,
        });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadResult = await uploadRes.json();
        photoArray.push(uploadResult.imageUrl);
      } catch (err) {
        console.error("Error uploading image:", err);
        return;
      }
    }

    const personObj = {
      treeId,
      creator: mongoUser,
      photoArray,
      ...formData,
    };

    try {
      const res = await fetch("http://localhost:5001/person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personObj),
      });
      if (!res.ok) throw new Error("Server error creating person");
      const createdPerson = await res.json();
      console.log("Person created:", createdPerson);

      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        parents: "",
        spouse: "",
        children: "",
        gender: "",
        birthDate: "",
        deathDate: "",
        partnerId: "",
        bio: "",
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      console.error("Error creating person:", err);
    }
  };

  return (
    <>
      
         <Header/>
         
      <form onSubmit={handleAddPerson} className="create-person-container">

        {/* Personal Info */}
        <div className="create-person-section">
          <h3>Personal Info</h3>
          <div className="form-row">
            <label>First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Middle Name</label>
            <input name="middleName" value={formData.middleName} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Suffix</label>
            <input name="suffix" value={formData.suffix} onChange={handleChange} />
          </div>

          <label>Gender</label>
          <div className="radio-container">
            {["male", "female", "other"].map((g) => (
              <label key={g}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={handleChange}
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Family Info */}
        <div className="create-person-section">
          <h3>Family Info</h3>
          <div className="form-row">
            <label>Parents</label>
            <input name="parents" value={formData.parents} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Spouse</label>
            <input name="spouse" value={formData.spouse} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Children</label>
            <input name="children" value={formData.children} onChange={handleChange} />
          </div>
        </div>

        {/* Dates */}
        <div className="create-person-section">
          <h3>Dates</h3>
          <div className="form-row">
            <label>Birth Date</label>
            <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Death Date</label>
            <input name="deathDate" type="date" value={formData.deathDate} onChange={handleChange} />
          </div>
        </div>

        {/* Biography & Profile Picture */}
        <div className="create-person-section">
          <h3>Biography & Profile Picture</h3>
          <div className="form-row">
            <label>Biography</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange}></textarea>
          </div>
          <div className="form-row">
            <label>Profile Picture</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} />
          </div>
        </div>

        <button type="submit" className="create-person-submit">Add Person</button>
      </form>
      <Footer />
    </>
  );
};

export default CreatePerson;