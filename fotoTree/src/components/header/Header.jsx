// //import clerk components
// import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
// //import react router components
// import { Link } from "react-router-dom";
// import "./Header.css"


// //todo create own navbar as document header

// // Navbar function component
// function Header() {
//   return (
//     <>
//       {/* Start of the navigation bar */}
//       <nav className="navbar navbar-expand-lg bg-body-tertiary">
//         <div className="container-fluid">
//           {/* Brand name for the navbar */}
//           <a className="navbar-brand" href="/">
//          FotoTree
//           </a>
//           <button
//             className="navbar-toggler"
//             type="button"
//             data-bs-toggle="collapse"
//             data-bs-target="#navbarSupportedContent"
//             aria-controls="navbarSupportedContent"
//             aria-expanded="false"
//             aria-label="Toggle navigation"
//           >
//             <span className="navbar-toggler-icon"></span>
//           </button>
//           <div className="collapse navbar-collapse" id="navbarSupportedContent">
//             {/* What links should a user see when signed in? */}
//             <SignedIn>
//               <ul className="navbar-nav me-auto  mb-lg-0">
//                 <li className="nav-item">
//                     {/* using link to avoid page refresh from an anchor tag */}
//                   {/* <Link to="/newpost" className="nav-link">
//                     {" "}
//                     Create A Blog!
//                   </Link> */}
//                 </li>

//                 <li className="nav-item">
//                   {/* <Link to="/myblogs" className="nav-link">
//                     {" "}
//                     My Blogs!
//                   </Link> */}
//                 </li>
//               </ul>

//                <UserButton afterSignOutUrl="/"/>
//             </SignedIn>
//             {/* If we want to logout or sign out how can we accomplish this? */}
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// }

// export default Header;


// Header.jsx
import './Header.css';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand name */}
        <Link to="/" className="navbar-brand">
          FotoTree
        </Link>

        {/* Signed Out / Signed In Links */}
        <div className="navbar-links">
          <SignedIn>
            <ul className="navbar-nav">
              {/* Example placeholder links */}
              <li className="nav-item">
                <Link to="/tree" className="nav-link">
                  My Tree
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/people" className="nav-link">
                  My People
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/photos" className="nav-link">
                  Photo Viewer
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/settings" className="nav-link">
                  Settings
                </Link>
              </li>
            </ul>

            {/* Clerk User Button */}
            <div className="navbar-user-button">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <Link to="/sign-in" className="nav-link">
              Sign In
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}

export default Header;
