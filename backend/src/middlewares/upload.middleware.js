const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    'uploads/homestays',
    'uploads/rooms',
    'uploads/restaurants', 
    'uploads/menus'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file field name
    if (file.fieldname.includes('homestay')) {
      uploadPath += 'homestays/';
    } else if (file.fieldname.includes('room')) {
      uploadPath += 'rooms/';
    } else if (file.fieldname.includes('restaurant')) {
      uploadPath += 'restaurants/';
    } else if (file.fieldname.includes('menu')) {
      uploadPath += 'menus/';
    } else {
      uploadPath += 'general/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Middleware for different upload scenarios
const uploadMiddleware = {
  // For homestay creation (multiple types of images with dynamic field names)
  homestayCreation: upload.any(), // Accept any field names to handle dynamic room_X_images and menu_X_images
  
  // For single homestay images
  homestayImages: upload.array('homestay_images', 5),
  
  // For room images
  roomImages: upload.array('room_images', 5),
  
  // For restaurant images
  restaurantImages: upload.array('restaurant_images', 3),
  
  // For menu images
  menuImages: upload.array('menu_images', 10),
  
  // Single image upload
  singleImage: upload.single('image')
};

module.exports = uploadMiddleware;