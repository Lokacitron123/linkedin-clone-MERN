import cloudinary from "../lib/cloudinary.config.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

import { sendCommentNotificationEmail } from "../utils/emails/email.handler.js";

import {
  createPostCommentSchema,
  createPostSchema,
} from "../utils/validationSchemas/post.validation.schema.js";

export const getPostsFeed = async (req, res) => {
  try {
    // Find posts where the author is in the current user's connections array
    // $in: Matches any of the values that are specified in an array
    // In this case, it checks if the author is one of the user's connections
    const posts = await Post.find({
      author: { $in: req.user.connections },
    })
      // Populate the "author" field with the specified fields from the User model
      // Populate will replace the ObjectId in "author" with the actual user data (name, username, profilePicture, headline)
      .populate("author", "name username profilePicture headline")

      // Populate the "comments.user" field (inside the comments array)
      // This fetches the name and profilePicture of the user who made each comment
      .populate("comments.user", "name profilePicture")

      // Sort the posts by the "createdAt" field in descending order (-1)
      // This ensures that the most recent posts appear first
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPostsFeed: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const parsedData = createPostSchema.safeParse(req.body);

    let newPost;

    if (parsedData.data.image) {
      const result = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content: parsedData.data.content,
        image: result.url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content: parsedData.data.content,
      });
    }

    await newPost.save();
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Error creating post ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0],
        function (result) {
          console.log(result);
        }
      );
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const parsedData = createPostCommentSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const post = await Post.findById(
      postId,
      {
        $push: { comments: { user: userId, content: parsedData.data.content } },
      },
      { new: true }
    ).populate("author", "name username email profilePicture headline"); // populate the author field with the specified fields to send as in email that a comment has been made to

    // Create a notification if the comment is not by the owner of the post
    if (post.author.toString() !== userId.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: userId,
        relatedPost: postId,
      });

      await newNotification.save();
      try {
        const postUrl = process.env.CLIENT_URL + "/post" + postId;

        await sendCommentNotificationEmail(
          post.author.email,
          post.author.name,
          req.user.name,
          postUrl,
          content
        );
      } catch (error) {
        console.error("Error in sendCommentNotificationEmail: ", error);
      }
    }

    // TODO - Send email if not the owner of the post
    //youtu.be/Ycg48pVp3SU?t=6734

    res.status(201).json({ message: "Comment created successfully" });
  } catch (error) {
    console.error("Error in createComment: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (post.likes.includes(userId)) {
      // unlike post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // like post
      post.likes.push(userId);
      // create notification
      if (post.author.toString() !== userId.toString()) {
        const newNotification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });

        await newNotification.save();
      }
    }

    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.error("Error in likePost: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
