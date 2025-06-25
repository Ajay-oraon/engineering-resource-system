const express = require("express");
const {
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.post("/login", login);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;