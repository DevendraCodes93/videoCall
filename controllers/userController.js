import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/generateToken.js";
export const checkAuth = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(400)
      .json({ message: "No token provided", success: false });

  const user = await User.findById(req.user.id).select("-password");

  if (!user)
    return res.status(401).json({ message: "User not found", success: false });

  return res.status(200).json({ message: "User found", success: true, user });
};
export const signUp = async (req, res) => {
  console.log(req.body);
  const { name, email, phoneNumber, password } = req.body.details;

  if (!name || !email || !phoneNumber || !password)
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  if (password.length < 6)
    return res.status(400).json({
      message: "Password must be greater that 6 characters",
      success: false,
    });
  const user = await User.findOne({ email });
  if (user)
    return res
      .status(400)
      .json({ message: "User already exists", success: false });

  const userWithPhoneNumber = await User.findOne({ phoneNumber });
  if (userWithPhoneNumber)
    return res
      .status(400)
      .json({ message: "User already exists", success: false });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email,
    phoneNumber,
    password: hashedPassword,
  });

  await newUser.save();
  const token = await generateToken(newUser, res);
  return res.status(201).json({
    message: "User created successfully",
    success: true,
    token,
    user: newUser,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body.details;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ message: "User does not exist", success: false });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "Invalid credentials", success: false });

  const token = await generateToken(user, res);
  return res
    .status(201)
    .json({ message: "Login successful", success: true, token, user });
};
export const logout = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "No token provided" });
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });

  return res.status(201).json({ message: "Logout successful", success: true });
};
