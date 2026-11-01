import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  findUserByEmail,
  createUser,
} from "../models/userModel.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check whether user already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user in database
    const user = await createUser(
      name,
      email,
      hashedPassword
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    // Handle duplicate email race condition
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

