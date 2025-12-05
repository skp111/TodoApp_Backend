require('dotenv').config();
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRouter');
const todoRouter = require('./routes/todoRouter');
const userRouter = require('./routes/userRouter');
const avatarRouter = require('./routes/avatarRouter');
const express = require('express');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/', avatarRouter);
app.use(authRouter);
app.use(todoRouter);
app.use(userRouter);
require('./controller/notification');

mongoose.connect(process.env.URL)
  .then(() => app.listen(process.env.PORT || 3000, () => console.log(`Server is running at ${process.env.BACKEND_URL}`)))
  .catch(err => console.log(err));
