const User = require("../model/userModel");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require('express-validator');
const sendEmail = require("./sendEmail");
const crypto = require("crypto");

exports.postRegister = [
    //Name validator
    check('username')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces in between'),

    //Email validator
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),

    //Password validator
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[\d]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character')
        .trim(),

    async (req, res) => {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password)
                return res.status(401).json({ success: false, message: "All fields are required" });

            const errors = validationResult(req); //creates an error object
            console.log(errors);
            if (!errors.isEmpty()) {
                return res.status(401).json({
                    success: false,
                    message: errors.array(), //array of objects
                });
            }
            const userEmail = await User.findOne({ email });
            if (userEmail) {
                return res.status(401).json({
                    success: false,
                    message: "Email already exists",
                });
            }
            const hashPassword = await bcrypt.hash(password, 10);
            const user = new User({ username, email, password: hashPassword });
            await user.save();
            res.status(200).json({ success: true, message: "User registered successfully" });
        } catch (err) {
            console.log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }
];

exports.postLogin = [
    //Email validator
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),

    //Password validator
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[\d]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character')
        .trim(),

    async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(401).json({ success: false, message: "All fields are required" });
            }
            const errors = validationResult(req); //creates an error object
            console.log(errors);
            if (!errors.isEmpty()) {
                return res.status(401).json({
                    success: false,
                    message: errors.array(), //array of objects
                });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: "User does not exist" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Incorrect password" });
            }
            const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
            
            const safeUser = { _id:user._id, username: user.username, email: user.email, bio: user.bio || "", avatar: user.avatar || "" };
            res.status(200).json({ success: true, message: "Logged in successfully", user: safeUser, token });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }
];

exports.sendSecurityCode = [
    //Email validator
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),

    async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(401).json({ success: false, message: "Email is required" });
            }
            const errors = validationResult(req); //creates an error object
            console.log(errors);
            if (!errors.isEmpty()) {
                return res.status(401).json({
                    success: false,
                    message: errors.array(), //array of objects
                });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: "User does not exist" });
            }
            // generate a 8-char alphanumeric code (cleaning base64 symbols)
            user.securityCode = crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
            user.securityCodeExpiration = Date.now() + 300000; // 5 minutes from now
            await user.save();
            const html = `
                <h3>Password Reset Request</h3>
                <p>Type the Security key below to reset your password:</p>
                <h4>Security Key: ${user.securityCode}</h4>
                <p>If you didn't request this, ignore this email.</p>
            `;
            await sendEmail({
                to: email,
                subject: "Password Reset Security Code",
                html
            });
            res.status(200).json({ success: true, message: "Security code sent successfully" });
        } catch (err) {
            console.log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }
];

exports.verifySecurityCode = [
    //Email validator
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    async (req, res) => {
        try{
            const { email, securityCode } = req.body;
            if (!email) {
                return res.status(401).json({ success: false, message: "Email is required" });
            }
            const errors = validationResult(req); //creates an error object
            console.log(errors);
            if (!errors.isEmpty()) {
                return res.status(401).json({
                    success: false,
                    message: errors.array(), //array of objects
                });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: "User does not exist" });
            }
            if (!user.securityCode || !user.securityCodeExpiration) {
                return res.status(401).json({ success: false, message: "Security code not set. Please request a new code." });
            }
            if (Date.now() > user.securityCodeExpiration) {
                user.securityCode = null;
                user.securityCodeExpiration = null;
                await user.save();
                return res.status(401).json({ success: false, message: "Security code has expired. Please request a new code." });
            }
            if (user.securityCode !== securityCode) {
                return res.status(401).json({ success: false, message: "Invalid security code" });
            }
            res.status(200).json({ success: true, message: "Security code verified successfully", user });
            // Clear the code and redirect to reset page with proper shape
            user.securityCode = null;
            user.securityCodeExpiration = null; 
            await user.save();
        }catch(err){
            console.log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }
];

exports.postResetPassword = [
    // Password validator
    check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[\d]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character')
    .trim(),
    
    // Confirm Password validator
    check('confirmPassword')
    .trim()
    .custom((value, { req }) => {
        if (value !== req.body.password) {
        throw new Error('Passwords do not match');
        }
        return true;
    }),

    async (req, res) => {
        try {
            const { _id, password, confirmPassword } = req.body;
            const user = await User.findById(_id);
            if (!user) {
                return res.status(401).json({ success: false, message: "User does not exist" });
            }
            const errors = validationResult(req); //creates an error object
            console.log(errors);
            if (!errors.isEmpty()) {
                return res.status(401).json({
                    success: false,
                    message: errors.array(), //array of objects
                });
            }
            const hashPassword = await bcrypt.hash(password, 10);
            user.password = hashPassword;
            await user.save();
            res.status(200).json({ success: true, message: "Password reset successfully" });
        } catch (err) {
            console.log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }
];

exports.postLogout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};
