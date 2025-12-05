const express = require('express');
const authRouter = express.Router();
const {postRegister, postLogin, sendSecurityCode, verifySecurityCode, postResetPassword, postLogout} = require('../controller/authCont');
const authMiddleware = require('../controller/authMiddleware');

authRouter.post('/register', postRegister);
authRouter.post('/login', postLogin);
authRouter.post('/send-code', sendSecurityCode);
authRouter.post('/verify-code', verifySecurityCode);
authRouter.post('/reset-password', postResetPassword);
authRouter.get('/verify-user', authMiddleware,(req, res) => {
    console.log('user verified');
    return res.status(200).json({
        success: true,
        message: "User verified",
        _id: req.user._id
    });
});
authRouter.post('/logout', postLogout);

module.exports = authRouter;