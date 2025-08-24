// import "../components/landingPage/landingPage.css";
import Title from "../components/landingPage/Title";
import landingPageImg from "../assets/landingPage.png";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { useState, useEffect } from "react";

const LandingPage = () => {
  // unpack clerk useUser object to personalize landing page once signed in
  const { user, isLoaded } = useUser();

  // Clerk user details
  const [firstName, setFirstName] = useState("");
  const [fullName, setFullName] = useState("");

  // Mongo user ID for referencing/creating the tree
  const [mongoUserId, setMongoUserId] = useState("");

  // when Clerk user is loaded, load their Mongo user id or create a user + tree
  useEffect(() => {
    if (isLoaded && user) {
      // set clerk variables
      setFirstName(user.firstName || "");
      setFullName(user.fullName || "");

      const getOrCreateMongoUser = async () => {
        try {
          // 1. Try to find existing user
          const res = await fetch(`http://localhost:5000/user/${user.id}`);
          const data = await res.json();
          console.log("User lookup:", data);
          //this message is provided by the server if the user isn't in our database...so we create one if it's received.
          if (data.message === "User not found") {
            console.log("Creating new user in Database...");
            const createUserRes = await fetch(`http://localhost:5000/user`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clerkId: user.id }),
            });

            const createdUser = await createUserRes.json();
            setMongoUserId(createdUser._id);

            // 2. Create a tree for the new user (use freshly created Mongo ID directly)
            const createTreeRes = await fetch(`http://localhost:5000/tree`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                owner: createdUser._id,
                name: user.fullName,
                description: `${user.firstName}'s Tree`,
              }),
            });

            if (!createTreeRes.ok) {
              throw new Error("Tree creation failed");
            }

            const createdTree = await createTreeRes.json();
            console.log("Created tree:", createdTree);
          } else {
            // Found existing Mongo user, let's use that info.
            setMongoUserId(data._id);
          }
        } catch (err) {
          console.error("Error in getOrCreateMongoUser:", err);
        }
      };

      getOrCreateMongoUser();
    }
  }, [isLoaded, user]);

  return (
    <div className="landingPage-container"> 
      {/* if signed out this all renders */}
      <SignedOut>
        <Header />
        <div>
          <Title />
          <h3>Every Family has a story to tell share yours on FotoTree</h3>
          <p>Please sign in to get started</p>
          <SignInButton  />
          <br />
          <br />
          <div>
            <img src={landingPageImg} alt="Computer using FotoTree" />
          </div>
          <Footer />
        </div>
      </SignedOut>

      {/* if signed in this all renders */}
      <SignedIn afterSigninUrl="/">
        <Header />
        <div>
          <Title />
          <h3>
            The "F" is for <strong>Family</strong>
          </h3>
          <p>Hi, {firstName} let's check out your family tree!</p>
          <p>Click below to view your tree:</p>
          <Link to="/tree">
            See my FotoTree!
          </Link>
          <Footer />
        </div>
      </SignedIn>
    </div>
  );
};

export default LandingPage;