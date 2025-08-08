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
console.log(user)

//set first name variable from clerk let's await the info
const [ firstName, setFirstName] = useState('')


//save a firstName for personalization--don't include it if info isn't loaded from clerk yet
useEffect(() => {
  if (isLoaded && user) {
    setFirstName(user.firstName || '');
  }
}, [user, isLoaded]);



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
        </div>
       
      </SignedIn>
    </>
  );
};

export default LandingPage;
