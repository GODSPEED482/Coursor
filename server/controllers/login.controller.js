const User = require("../models/User.model");

async function loginController(req, res) {
  try {
    const { name, email, image } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      await new User({
        name,
        email,
        image,
      }).save();

      return res.status(200).json({
        success: true,
        message: "User created successfully",
      });
    }

    res.status(200).json({
      success: true,
      message: "User already exists",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

module.exports = loginController;
