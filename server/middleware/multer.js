// need this to parse the multipart data (file uploads)
const multer = require('multer');
// need this to extract file name extensions
const path = require('path');

const upload = multer ({
  storage: multer.diskStorage({
  // on the server store the received file at uploads folder
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // specify the folder to save files
  },
  filename: (req, file, cb) => {
    //use original name + timestamp to avoid filename conflicts 
    cb(null, Date.now() + path.extname(file.originalname));
  }
}),
  
  fileFilter: (req, file, cb) => {
    // check if the file is an image
    const ext = path.extname(file.originalname).toLowerCase();
    console.log("ext is: ", ext)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  }

})

module.exports = upload;