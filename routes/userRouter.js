// server/routes/userRouter.js
const express = require('express');
const userRouter = express.Router();
const updateUser = require('../controller/userCont');

// POST /user - update user (multipart/form-data)
userRouter.post('/user', updateUser);

module.exports = userRouter;
