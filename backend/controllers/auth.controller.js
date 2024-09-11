import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signupSchema } from "../utils/validationSchemas/user.validation.schema.js";

export const signup = async (req, res) => {
  try {
    const parsedData = signupSchema.safeParse(req.body); // Zod validation

    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const { name, username, email, password } = parsedData.data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: username._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.cookie("jwt-linkedin", token, {
      httpOnly: true, // XSS prevention
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict", // CSRF prevention
      secure: process.env.NODE_ENV === "production", // prevents man-in-the-middle attacks
    });

    res.status(201).json({ message: "User created successfully" });

    const profileUrl = `${process.env.CLIENT_URL}/profile/${username}`;

    try {
      await sendWelcomeEmail(email, name, profileUrl);
    } catch (emailError) {
      console.error("Error sending welcome email", emailError);
    }
  } catch (error) {
    console.log("Error in signup", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = (req, res) => {
  res.send("login");
};

export const logout = (req, res) => {
  res.send("logout");
};
