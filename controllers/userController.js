const User = require("../models/User");

const getProfile = async (req, res) => {
	return res.status(200).json({ success: true, user: req.user });
};

const listUsers = async (_req, res) => {
	try {
		const users = await User.find()
			.select("name email role createdAt")
			.sort({ createdAt: -1 });

		return res.status(200).json({ success: true, users });
	} catch (error) {
		console.error("List users error:", error);
		return res.status(500).json({ message: "Failed to fetch customer accounts." });
	}
};

module.exports = { getProfile, listUsers };