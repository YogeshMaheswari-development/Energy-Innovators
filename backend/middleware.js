const multer = require('multer');
const storage = multer.memoryStorage();
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const upload = multer({ storage: storage });
const { File } = require('./model');
const isAuth = (req, res, next) => {
    const authorization = req.get('Authorization');
    if (!authorization) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    const token = authorization.split(' ')[1];
    try {
        const decodedToken = jwt.verify(token, secret);
        req.userId = decodedToken.userId;
        next();
    } catch (err) {
        res.status(500).json({ message: 'Error verifying token' });
    }
};

const FileMiddleware = (req, res, next) => {
  let file = req.file;
  if (!file) {
      return res.status(400).json({ 
          status: 'error',
          message: 'Profile picture is required. Please upload an image file.' 
      });
  }
  
  if(!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ 
          status: 'error',
          message: 'Uploaded file must be an image' 
      });
  }
  
  if (file.size > 5 * 1024 * 1024) {  // 5MB limit
      return res.status(400).json({ 
          status: 'error',
          message: 'File size must be less than 5MB' 
      });
  }

  const fileupload = new File({
      contentType: file.mimetype,
      data: file.buffer,
  });

  fileupload.save()
      .then((file) => {
          req.fileId = file._id;
          next();
      })
      .catch(err => {
          res.status(500).json({ 
              status: 'error',
              message: 'Error saving file' 
          });
      });
};


module.exports = { isAuth , FileMiddleware, upload};