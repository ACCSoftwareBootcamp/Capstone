// import './Footer.css'

// const Footer = () => {
//   return (
//     <>
//     <hr />

//     <br />

//     <div className='container'>
//      <div>Home</div>
//      <div>My Tree</div>
//      <div>Friends</div>
//      <div>Photo Viewer</div>
//      <div>Settings</div>   
//     </div>

//     <br />

//     <div>
//         <p>
//             All rights reserved by FotoTree 2025 incorporated 
//         </p>
//     </div>
//     </>
//   )
// }

// export default Footer


import './Footer.css'

const Footer = () => {
  return (
    <footer className="app-footer">

      {/* Divider */}
      <hr className="footer-divider" />

      {/* Navigation links */}
      <div className="footer-links">
        <div className="footer-link">Home</div>
        <div className="footer-link">My Tree</div>
        <div className="footer-link">Friends</div>
        <div className="footer-link">Photo Viewer</div>
        <div className="footer-link">Settings</div>
      </div>

      {/* Divider */}
      <hr className="footer-divider" />

      {/* Copyright */}
      <div className="footer-copy">
        <p>All rights reserved by FotoTree 2025 Incorporated</p>
      </div>
    </footer>
  )
}

export default Footer
