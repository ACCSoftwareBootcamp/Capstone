import "../components/landingPage/landingPage.css";
import Title from "../components/landingPage/Title";
import landingPageImg from "../assets/landingPage.png"
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { useState, useEffect} from "react";



const LandingPage = () => {
//unpack clerk useUser object to personalize any info needed on our landing page once signedIn
const { user, isLoaded} = useUser()

//set first name variable from clerk let's await the info
const [ firstName, setFirstName] = useState('')

//initialize variable of mongo user id--needed to see if they are already a fotoTree user to create/load their tree
const [ mongoUserId, setMongoUserId] = useState('')

//when clerk user is loaded, load their mongo user id to use for tree reference and person creation
useEffect(() => {
  if (isLoaded && user) {
    const getOrCreateMongoUser = async () => {
      try {
        // 1. Try to find existing user
        const res = await fetch(`http://localhost:3000/user/${user.id}`);
        const data = await res.json();
        console.log(data)

        if (data.message === "User not found") {
          // 2. If not found, create one
          const createRes = await fetch(`http://localhost:3000/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clerkId: user.id }),
          });
          const createdUser = await createRes.json();
          setMongoUserId(createdUser._id);
        } else {
          // Found existing
          setMongoUserId(data._id);
        }
      } catch (err) {
        console.error(err);
      }

      // 3. Always set first name for personalization
      setFirstName(user.firstName || "");
    };

    getOrCreateMongoUser();
  }
}, [isLoaded, user]);




  return (
    <>
      {/* if signed out this all renders */}
      <SignedOut>
        <Header />
        <div className="text-center mt-5">
          <Title />
          <h3>Every Family has a story to tell share yours on FotoTree</h3>

          <p>Please sign in to get started</p>

          <SignInButton className="px-3 py-1 rounded-1 btn btn-primary" />

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
        <div className="text-center mt-5">
          <Title />
          <h3>The "F" is for <strong>Family</strong></h3>
           <p>Hi, {firstName} let's check out your family tree!</p>
              <p> Click below to view your tree:</p>
           <Link to="/tree" className="btn btn-success">
                    See my FotoTree!
                  </Link>

                  <Footer />
        </div>
       
      </SignedIn>
    </>
  );
};

export default LandingPage;
