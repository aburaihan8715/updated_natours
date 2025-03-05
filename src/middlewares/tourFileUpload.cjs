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
    folder: 'updatedNatours/tourImages', // Optional: Folder for uploaded files in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Optional: Restrict allowed file types
    transformation: [{ width: 1600, height: 900, crop: 'limit' }], // Optional: Apply image transformations on upload
    public_id: Math.floor(Date.now() / 1000),
  },
});

const tourFileUpload = multer({ storage: storage });

module.exports = tourFileUpload;
