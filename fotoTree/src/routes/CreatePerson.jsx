import { useState, useEffect, useRef } from "react";
import "../components/addPersonForm/CreatePerson.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { useUser } from "@clerk/clerk-react";

//when we go to create person we need to poll the db for the users tree and save it a variable to use in each person object

const CreatePerson = () => {
  //clerk id to get treeId for submission and relating the person to a particular tree
  const { user, isLoaded } = useUser();
  const [treeId, setTreeId] = useState("");
  const [mongoUser, setMongoUser] = useState("");

  //when clerk user is loaded, load their mongo user id to use for tree reference and person creation
  useEffect(() => {
    if (isLoaded && user) {
      const fetchUserAndTree = async () => {
        try {
          // 1. Find existing user
          const userRes = await fetch(`http://localhost:3000/user/${user.id}`);
          if (!userRes.ok) throw new Error("Failed to fetch user");
          const userData = await userRes.json();
          console.log("existing user data", userData);
          // 2. set mongoUser to find tree and use in person creation
          setMongoUser(userData._id);

          // 3. Use mongo user ID to find tree
          const treeRes = await fetch(
            `http://localhost:3000/tree/${userData._id}`
          );
          if (!treeRes.ok) throw new Error("Failed to fetch tree");
          const treeData = await treeRes.json();
          console.log("tree data", treeData);
          // 4. set tree id so created object can be related.
          setTreeId(treeData._id);
        } catch (err) {
          console.error("Error getting user or tree from database", err);
        }
      };
      //call the function!
      fetchUserAndTree();
    }
  }, [isLoaded, user]);

  //initialize th formData with empty values
  //todo server only accepts treeId, firstName, lastName right now
  //once other fields are supported add them to the  handleAddData
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    // deathDate: "",
    // gender: "",
    // momId: "",
    // dadId: "",
    partnerId: "",
    // childId: "",
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

    //if tree id isn't set yet, exit the function until it resolves
    if (!treeId) {
      console.error("Tree ID not ready yet");
      return;
    }

    // Build object to send...
    const personObj = {
      treeId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      creator: mongoUser,
    };

    console.log("Saving person:", personObj);
    //send it to server as a POST
    try {
      const res = await fetch("http://localhost:3000/person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personObj),
      });

      if (!res.ok) throw new Error("Server error");

      const createdResponse = await res.json();
      console.log("Person created:", createdResponse);

      // Clear just the form fields, without resetting the treeId from useEffect so another can be created
      setFormData({
        firstName: "",
        lastName: "",
        birthDate: "",
        // deathDate: "",
        gender: "",
        // momId: "",
        // dadId: "",
        partnerId: "",
        // childId: "",
        bio: "",
        image: "",
      });
    } catch (err) {
      console.error("Error creating person:", err);
    }
  };
  // selected file ref on the browser
  const [file, setFile] = useState(null);

  // url to the cloud stored image
  const [savedImage, setSavedImage] = useState("");

  // create an empty ref to hold the file input element
  const fileInputRef = useRef(null);

  // handles references when user selects a file
  const handleFileChange = (event) => {
    console.log(event.target.file);
    // get a ref to the file selected by user
    const selectedFile = event.target.files[0];
    // save to state
    setFile(selectedFile);
  };

  // Send off our image to the server
  const handleUpload = async () => {
    // if there is no file, throw error
    if (!file) {
      alert("Please select a file before uploading!!");
      // no file? nothing more to be done, get the hell out
      return;
    }

    // create formData object
    const formData = new FormData();
    // append file ref to the formData object
    formData.append("file", file);
    // console.log('FormData: ', formData);

    try {
      // try to run something that may cause an err
      // send the formData obj to server
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });
      console.log("CreatePerson.jsx: response: ", response);

      // check for ok
      // if (!response.ok) throw new Error("File upload failed");

      // parse the response
      const result = await response.json();

      // image url to be saved to state
      // console.log("Result: ", result);

      // set the savedImage state to the imageUrl from the response
      // this will trigger a re-render and display the image
      setSavedImage(result.imageUrl);
    } catch (error) {
      // do something if an err is detected
      console.error("Error uploading file:", error);
    } finally {
      // clear the file input after upload
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // reset the input value
      }
      setFile(null); // reset the file state
    }
  };

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
          <label htmlFor="bio">Biography</label>
          <textarea
            name="bio"
            id="bio"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <h4>Profile Picture</h4>
          <input
            type="file"
            name="file"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {/* <button onClick={handleUpload}>Add Person</button> */}
        </div>

        {/* Display the uploaded image if available */}
        {savedImage && (
          <div>
            <h3>Uploaded Image</h3>

            <img
              htmlFor="image"
              id="image"
              style={{ maxWidth: "40%" }}
              src={savedImage}
              alt="Uploaded image"
            />
          </div>
        )}
      </form>
      <br />
      <div className="form-group">
        <button onClick={handleUpload} type="submit">
          Add Person
        </button>
      </div>

      <Footer />
    </>
  );
};

export default CreatePerson;
