const express = require('express');
require('dotenv').config();
const auth = require('./routes/auth');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const businessRoutes = require('./routes/business');
const bodyparser = require('body-parser');
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(bodyparser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost/Energy_Innovators');
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} at ${new Date().toString()}`);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/business', businessRoutes);

app.use('/auth', auth);
app.listen(3001, () => {
  console.log('Server started on port 3001');
});
