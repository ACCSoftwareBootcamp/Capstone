import "./landingPage.css";
import Title from "./Title";
import landingPageImg from "../../assets/landingPage.png";
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const LandingPage = () => {
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
           <p>Let's get started on your family tree</p>
              <p> Click below to view or start your tree</p>
          <button className="btn btn-success"> My Tree!</button>
        </div>
       
      </SignedIn>
    </>
  );
};

export default LandingPage;
