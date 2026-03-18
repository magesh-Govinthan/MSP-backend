import User from "../models/User.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto" 
import { sendEmail } from "../Utils/sendEmail.js";

// REGISTER
export const register = async (req, res) => {
  console.log(req);
  try {
    const { name, email, password, role, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });
  console.log(user,"user:");
  
   await user.save()
    res.status(201).json({
      message: "User registered",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//FORGOT PASSWORD
export const forgotPw=async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  console.log('the user is ', user);
  if (!user) return res.status(400).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
 
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; 
  await user.save();
const link = `http://localhost:5173/${token}`;
const html = `<a href="${link}">Click here</a>`;

  await sendEmail(email,"reset password", html);

  res.json({ message: "Reset link sent to email" });
};

//RESET PASSWORD
export const resetPw= async (req, res) => {
  const { password } = req.body;

  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Token invalid or expired" });

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.json({ message: "Password updated successfully" });
}
