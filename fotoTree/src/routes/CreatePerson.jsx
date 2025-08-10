import { useState, useEffect } from "react";
import '../components/addPersonForm/CreatePerson.css';
import Header from "../components/header/Header";
import Footer from '../components/footer/Footer';
import {useUser} from "@clerk/clerk-react"



const CreatePerson = () => {

  
//clerk id to use as treeId for submission and relating the person to a particular tree
const {user, isLoaded} = useUser()

const [treeId, setTreeId] = useState('')

//if user is loaded set tree id with clerk user info 
useEffect(() => {
  if (isLoaded && user) {
    //using the last 24 characters of 32 char string to comply with mongo formatting
    //todo consider creating our own user id's to ensure 0 chance of conflict
    setTreeId(user.id)
    console.log("clerk user", user)
  }
}, [user, isLoaded]);

//initialize th formData with empty values
//todo server only accepts treeId, firstName, lastName right now
//once other fields are supported add them to the  handleAddData
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    deathDate: "",
    gender: "",
    momId: "",
    dadId: "",
    partnerId: "",
    childId: "",
    bio: "", 
  });

  //when each element changes take the previous value and amend the change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  //to be fired when the form submits. prevent default behavior and send values to server for mongo creation
  //has a fetch so async function with try/catch block
 const handleAddData = async (e) => {
  e.preventDefault();

  // Build object to send...
  const personObj = {
    treeId,
    firstName: formData.firstName,
    lastName: formData.lastName,
  };

  console.log("Saving person:", personObj);

  try {
    const res = await fetch("http://localhost:3000/person", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personObj),
    });

    if (!res.ok) throw new Error("Server error");

    const createdResponse = await res.json();
    console.log("Person created:", createdResponse);

    // Clear just the form fields, without resetting the treeId from useEffect
    setFormData({
      firstName: "",
      lastName: "",
      birthDate: "",
      deathDate: "",
      gender: "",
      momId: "",
      dadId: "",
      partnerId: "",
      childId: "",
      bio: "",
    });
  } catch (err) {
    console.error("Error creating person:", err);
  }
};
;

  return (
    <>
      <Header />
      <br />
      <br />
      <form onSubmit={handleAddData}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input 
            id="firstName" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input 
            id="lastName" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Birth Date</label>
          <input 
            id="birthDate" 
            name="birthDate" 
            type="date"
            value={formData.birthDate} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="deathDate">Death Date</label>
          <input 
            id="deathDate" 
            name="deathDate" 
            type="date"
            value={formData.deathDate} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select 
            name="gender" 
            id="gender" 
            value={formData.gender} 
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="momId">Mother</label>
          <select 
            name="momId" 
            id="momId" 
            value={formData.momId} 
            onChange={handleChange}
          >
            <option value="">None</option>
            <option value="mom">Mother</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dadId">Father</label>
          <select 
            name="dadId" 
            id="dadId" 
            value={formData.dadId} 
            onChange={handleChange}
          >
            <option value="">None</option>
            <option value="dad">Father</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="partnerId">Partner</label>
          <select 
            name="partnerId" 
            id="partnerId" 
            value={formData.partnerId} 
            onChange={handleChange}
          >
            <option value="">None</option>
            <option value="husband">Husband</option>
            <option value="wife">Wife</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="childId">Children</label>
          <select 
            name="childId" 
            id="childId" 
            value={formData.childId} 
            onChange={handleChange}
          >
            <option value="">None</option>
            <option value="son">Son</option>
            <option value="daughter">Daughter</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Biography</label>
          <textarea 
            name="bio" 
            id="bio" 
            value={formData.bio} 
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group">
          <button type="submit">Add Person</button>
        </div>
      </form>
      <br />
      <Footer />
    </>
  );
};

export default CreatePerson;
