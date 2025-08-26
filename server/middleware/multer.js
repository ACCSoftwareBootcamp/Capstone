// need this to parse the multipart data (file uploads)
const multer = require('multer');
// need this to extract file name extensions
const path = require('path');

const upload = multer({
  storage: multer.diskStorage({}),
  // todo - add a file extension filter
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // specify the directory to save the uploaded files
  },
    // create a unique filename using the original name and current timestamp

  fileFilter: (req, file, cb) => {
    // check if the file is an image
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  }

})

module.exports = upload;