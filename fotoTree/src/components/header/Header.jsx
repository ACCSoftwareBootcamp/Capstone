
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
                  My Family
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/person" className="nav-link">
                  Add Person
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
