require('dotenv').config({path: '.env'});

const cloudinary = require('cloudinary').v2;

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

// console.log('CLOUD_NAME :', CLOUD_NAME)

// connect to cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
})

// Delete an image by public ID
cloudinary.uploader.destroy('sample', function(error, result) {
  console.log(result, error);
});

module.exports = cloudinary