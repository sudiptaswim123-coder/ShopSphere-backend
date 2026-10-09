const express = require("express");
const { getProfile, listUsers } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.get("/", protect, adminOnly, listUsers);

module.exports = router;