import React, { useState } from "react";
import "./CreatePerson.css";
import { use } from "react";

const CreatePerson = () => {
  const [formData, setFormData] = useState([
    // Initial state for form data    
    {
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
    },
  ]);

  //State to keep track of what the user is inputting to add new person
  const [newFormData, setNewFormData] = useState("");

  const handleChange = (event) => {
    setNewFormData(event.target.value);
  };

  const handleAddData = (e) => {
    e.preventDefault();

    if (newFormData.trim() !== "") {
      let obj = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        deathDate: formData.deathDate,
        gender: formData.gender,
        momId: formData.momId,
        dadId: formData.dadId,
        partnerId: formData.partnerId,
        childId: formData.childId,
        bio: formData.bio,
      };

      setFormData([...formData, obj]);
    }

   
  };

  return (
    <>
      <form onSubmit={(e) => handleAddData(e)}>
        <div className="form-group">
          <label htmlFor="firstName"> First Name </label>
          <input id="firstName" name="firstName" />
        </div>

        <div className="form-group">
          <label htmlFor="lastName"> Last Name </label>
          <input id="lastName" name="lastName" />
        </div>

        <div className="form-group">
          <label htmlFor="birthDate"> Birth Date </label>
          <input id="birthDate" name="birthDate" />
        </div>

        <div className="form-group">
          <label htmlFor="deathDate"> Death Date </label>
          <input id="deathDate" name="deathDate" />
        </div>

        <div className="form-group">
          <label htmlFor="gender"> Gender </label>
          <select name="gender" id="gender">
            <option value="">Select</option>
            <option value="male"> Male </option>
            <option value="female"> Female </option>
            <option value="other"> Other </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="momId"> Mother </label>
          <select name="momId" id="momId">
            <option value="">None</option>
            <option value="mom"> Mother </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dadId"> Father </label>
          <select name="dadId" id="dadId">
            <option value="">None</option>
            <option value="dad"> Father </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="partnerId"> Partner </label>
          <select name="partnerId" id="partnerId">
            <option value="">None</option>
            <option value="husband"> Husband </option>
            <option value="wife"> Wife </option>
            <option value="other"> Other </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="childId"> Children </label>
          <select name="childId" id="childId">
            <option value="">None</option>
            <option value="son"> Son </option>
            <option value="daughter"> Daughter </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bio"> Biography</label>
          <textarea name="bio" id="bio"></textarea>
        </div>

        <div className="form-group">
          <button type="submit" onChange={handleChange}>
            {" "}
            Add Person{" "}
          </button>
        </div>

        <div className="form-group"></div>
        
      </form>

      
    </>
  );
  console.log(obj)
};

export default CreatePerson;
