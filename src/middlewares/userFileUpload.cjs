const { CloudinaryStorage } = require('@fluidjs/multer-cloudinary');
const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dhcfqmwzc',
  api_key: '791392696454122',
  api_secret: 'udWMmzMgfbv9vRYVP5QendUvbbs',
});

// Configure CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'updatedNatours/users', // Optional: Folder for uploaded files in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Optional: Restrict allowed file types
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional: Apply image transformations on upload
    public_id: Math.floor(Date.now() / 1000),
  },
});

const userFileUpload = multer({ storage: storage });

module.exports = userFileUpload;
