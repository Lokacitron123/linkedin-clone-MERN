import cloudinary from "../lib/cloudinary.config.js";
import User from "../models/user.model.js";
import { updateProfileSchema } from "../utils/validationSchemas/user.validation.schema.js";

export const getSuggestedConnections = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");

    // Find all users that are not in the current user's connections

    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id, // $ne = not equal. Not equal to the current user
        $nin: currentUser.connections, // $nin = not in. Not in the current user's connections
      },
    })
      .select("name username profilePicture headline") // selects these properties
      .limit(3); // selects only 3 suggested users;

    res.json(suggestedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const parsedData = updateProfileSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const allowedFields = [
      "name",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    const updatedData = {};

    for (const field of allowedFields) {
      if (parsedData.data[field]) {
        updatedData[field] = parsedData.data[field];
      }
    }

    // Upload profile picture and banner image to Cloudinary
    if (parsedData.data.profilePicture) {
      const result = await cloudinary.uploader.upload(
        parsedData.data.profilePicture
      );
      updatedData.profilePicture = result.secure_url;
    }
    if (parsedData.data.bannerImg) {
      const result = await cloudinary.uploader.upload(
        parsedData.data.bannerImg
      );
      updatedData.bannerImg = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: updatedData,
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
