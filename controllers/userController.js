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
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// LOGIN
export const login = async (req, res) => {
  console.log(req.query);
  try {
    const { email, password } = req.query;

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
  console.log(token);
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; 
  await user.save();
const link = `http://localhost:5173/reset-password/${token}`;
const html = `<a href="${link}">Click here</a>`;

  await sendEmail(email,"reset password", html);

  res.json({ message: "Reset link sent to email", token });
};

//RESET PASSWORD
export const resetPw= async (req, res) => {
  console.log(req.body);
  const { password } = req.body;
  console.log(req.params.token);
  const user = await User.findOne({
    resetToken: req.params.token,
  });
  console.log('Token expiry:', user, 'Now:', Date.now());
  if (!user) return res.status(400).json({ message: "Token invalid or expired" });

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();

  res.json({ message: "Password updated successfully" });
}


// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    await user.save();

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


