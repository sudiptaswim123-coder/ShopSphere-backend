const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");

const makeAdmin = async () => {
  try {
    await connectDB();

    const email = process.argv[2];

    if (!email) {
      console.log(
        "Please provide an email address."
      );

      console.log(
        "Example: npm run make-admin test@example.com"
      );

      process.exit(1);
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      console.log(
        `No user found with email: ${email}`
      );

      process.exit(1);
    }

    user.role = "admin";

    await user.save();

    console.log(
      `${user.email} is now an admin.`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to make admin:",
      error
    );

    process.exit(1);
  }
};

makeAdmin();