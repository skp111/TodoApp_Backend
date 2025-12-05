const express = require('express');
const User = require('../model/userModel');
const avatarRouter = express.Router();

avatarRouter.get('/user/avatar/:_id', async (req, res) => {
    const _id = req.params._id;
    const user = await User.findById(_id);
    if (!user || !user.avatar?.data) {
        return res.status(404).send("Avatar not found");
    }
    res.set('Content-Type', user.avatar.contentType);
    res.send(user.avatar.data);
});

module.exports = avatarRouter;
