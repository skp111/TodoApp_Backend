// server/controller/userCont.js
const User = require("../model/userModel");
const upload = require('../model/fileStorage');

module.exports = updateUser = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { _id, bio } = req.body;
      if (!_id) {
        return res.status(401).json({ success: false, message: "User ID is Missing" });
      }
      const user = await User.findById(_id);
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      // Update bio only if provided (note: empty string is a valid update if user typed it)
      if (bio !== undefined)
        user.bio = bio;

      if (req.file) {
        user.avatar = {
          data: req.file.buffer,        // ✅ binary image
          contentType: req.file.mimetype
        };
      }
      await user.save();
      return res.status(201).json({ success: true, message: "Profile updated successfully", user });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, message: "Error while updating user" });
    }
  }
];
