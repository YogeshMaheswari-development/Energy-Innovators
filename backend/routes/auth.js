const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isAuth, FileMiddleware, upload } = require('../middleware');
const secret = process.env.SECRET;
const refreshSecret = process.env.REFRESH_SECRET;
const { User, Innovator, Business, File } = require('../model');

// Routes
router.post('/register', [upload.single('profilePicture'), FileMiddleware], async (req, res) => {
  let user;
  const { userType } = req.query;
  const { name, email, password, phoneNumber, address } = req.body;
  if (userType === 'user') {
    user = new User();
    user.role = 'user';
  }
  if (userType === 'innovator') {
    const { about, skills,achievements,website } = req.body;
    user = new Innovator({ about, skills, achievements,website });
    user.role = 'innovator';
  }
  if (userType === 'business') {
    const { about, skills, website,socialLinks,availability } = req.body;
    user = new Business({ about, skills,website,socialLinks,availability });
    user.role = 'business';
  }
  if (!user) {
    return res.status(400).json({ message: 'Invalid user type' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.profilePicture = req.fileId;
    user.phoneNumber = phoneNumber;
    user.address = address;
    user.name = name;
    user.email = email;
    await user.save();
    const iat = Math.floor(Date.now() / 1000);
    const token = jwt.sign({ user: user, role: user.role, iat, exp: iat + 900 }, secret);
    const refreshToken = jwt.sign({ user: user, role: user.role, iat, exp: iat + 86400 }, refreshSecret);
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.status(201).json({ token });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }) || await Innovator.findOne({ email }) || await Business.findOne({ email });
  user.role = user.collection.name === "users" ? "user" : user.collection.name === "innovators" ? "innovator" : "business"
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const iat = Math.floor(Date.now() / 1000);
  const token = jwt.sign({ user: user, role: user.role, iat, exp: iat + 900 }, secret);
  const refreshToken = jwt.sign({ user: user, role: user.role, iat, exp: iat + 86400 }, refreshSecret);
  res.cookie('refreshToken', refreshToken, { httpOnly: true });
  res.status(200).json({ token, userId: user.id });
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decodedToken = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decodedToken.user.id) || await Innovator.findById(decodedToken.user.id) || await Business.findById(decodedToken.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const iat = Math.floor(Date.now() / 1000);
    const token = jwt.sign({ user: user, role: user.role, iat, exp: iat + 900 }, secret);
    res.status(200).json({ token, userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

router.post('/logout', async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout successful' });
});

router.post("/check-account", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }) || await Innovator.findOne({ email }) || await Business.findOne({ email });
    res.status(200).json({ exists: user ? true : false });
  } catch (err) {
    res.status(500).json({ message: 'Error checking user' });
  }
});

router.get("/image/:id", async (req, res) => {
  try {
    const file = await File.find({ fileID: req.params.id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.set('Content-Type', file[0].contentType);
    res.send(file[0].data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error fetching file' });
  }
});

// Authenticated routes
router.get('/get/:type', isAuth, async (req, res) => {
  try {
    const { type } = req.body;
    if (type === 'user') {
      const users = await User.find();
      res.status(200).json(users);
    } else if (type === 'innovator') {
      const innovators = await Innovator.find();
      res.status(200).json(innovators);
    } else if (type === 'business') {
      const businesses = await Business.find();
      res.status(200).json(businesses);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/user/:id', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id) || await Innovator.findById(req.params.id) || await Business.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

router.get('/update/:id', [isAuth, upload.single('profilePicture'), FileMiddleware], async (req, res) => {
  try {
    const user = await User.findById(req.params.id) || await Innovator.findById(req.params.id) || await Business.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } else {
      // Update logic here
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

router.get('/delete/:id', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id) || await Innovator.findById(req.params.id) || await Business.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;