import { Link, useLocation } from "react-router-dom";
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <hr />
      <br />
      <div className='footer-container'>
        <Link to="/" className={`footer-link ${isActive("/") ? "active" : ""}`}>
          Home
        </Link>
        <Link to="/tree" className={`footer-link ${isActive("/tree") ? "active" : ""}`}>
          My Tree
        </Link>
        <Link to="/people" className={`footer-link ${isActive("/people") ? "active" : ""}`}>
          My Family
        </Link>
        <Link to="/person" className={`footer-link ${isActive("/person") ? "active" : ""}`}>
          Add Family Member
        </Link>
        <span className="footer-link disabled">About</span>
        <span className="footer-link disabled">My Account</span>
      </div>
      <br />
      <div className="footer-bottom">
        <p>All rights reserved by FotoTree 2025 incorporated</p>
      </div>
    </>
  );
};

export default Footer;
