import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import LandingPage from "./components/landingPage/LandingPage";

//import clerk components to customize signed in vs signed out view
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

//import necessary components from react-router stuff
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
