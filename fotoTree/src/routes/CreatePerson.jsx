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
    lastName: "",
    birthDate: "",
    partnerId: "",
    bio: "",
  });

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Load mongoUser and treeId when Clerk user is loaded
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchMongoUserAndTree = async () => {
      try {
        // Fetch Mongo user using Clerk ID
        const userRes = await fetch(`http://localhost:5001/user/${user.id}`);
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setMongoUser(userData._id);

        // Fetch tree using Mongo user ID
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
    if (!treeId) {
      console.error("Tree ID not ready yet");
      return;
    }

    let photoArray = [];

    // Upload image first if file selected
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
      firstName: formData.firstName,
      lastName: formData.lastName,
      creator: mongoUser, // Mongo user ID
      photoArray,
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
        lastName: "",
        birthDate: "",
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
      <Header />
      <form onSubmit={handleAddPerson}>
        <div className="form-group">
          <label>First Name</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Birth Date</label>
          <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Biography</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange}></textarea>
        </div>

        <div className="form-group">
          <label>Profile Picture</label>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        <button type="submit">Add Person</button>
      </form>
      <Footer />
    </>
  );
};

export default CreatePerson;
