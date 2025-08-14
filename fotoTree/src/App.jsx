import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
//import routes
import LandingPage from "./routes/LandingPage";
import Tree from "./routes/Tree"
<<<<<<< Updated upstream
import CreatePerson from "./routes/CreatePerson"; 
=======
import PersonFormPlaceholder from './routes/PersonFormPlaceholder'
import PersonCard from "./routes/PersonCard";
import Friends from "./components/Friends/Friends";



>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      <Router>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tree" element= {< Tree />} />
        <Route path="/person" element= {< CreatePerson />} />
=======
<Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/tree" element={<Tree />} />
    <Route path="/person" element={<PersonCard />} />
    <Route path="/friends" element={<Friends />} />
>>>>>>> Stashed changes

  </Routes>
</Router>
    </>
  );
}

export default App;
