import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { sendConnectionAcceptedEmail } from "../utils/emails/email.handler.js";

export const sendConnectionRequest = async (req, res) => {
  const { userId } = req.params;
  const senderId = req.user._id;

  try {
    if (userId === senderId.toString())
      return res
        .status(400)
        .json({ message: "You cannot connect with yourself" });

    if (req.user.connections.includes(userId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });

    await newRequest.save();
    return res.status(201).json({
      message: "Request sent successfully",
    });
  } catch (error) {
    console.log("Error in sendConnectionRequest: ", error);
    return res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  try {
    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.recipient._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.status = "accepted";
    await request.save();

    // If Im your friend, you're my friend too
    // Push the requesting user's ID to the recipient's connections array
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });

    // Push the recipient's ID to the requesting user's connections array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });

    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: userId,
    });

    await notification.save();
    res.status(200).json({ message: "Request accepted successfully" });

    // todo: send email notification
    const senderEmail = request.sender.email;
    const senderName = request.sender.name;
    const recipientName = [{ email: senderEmail }];
    const profileUrl =
      process.env.CLIENT_URL + "/profile/" + request.recipient.username;

    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileUrl
      );
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log("Error in acceptConnectionRequest: ", error);
    return res.status(500).json({ message: error.message });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;
  try {
    const request = await ConnectionRequest.findById(requestId);

    if (request.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.status = "rejected";
    await request.save();
    res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    console.log("Error in rejectConnectionRequest: ", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getConnectionRequests = async (req, res) => {
  const userId = req.user._id;

  try {
    const requests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");

    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getConnectionRequests: ", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserConnections = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.connections);
  } catch (error) {
    console.log("Error in getUserConnections: ", error);
    return res.status(500).json({ message: error.message });
  }
};

export const removeConnection = async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  try {
    await User.findByIdAndUpdate(myId, {
      $pull: { connections: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { connections: myId },
    });

    res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.log("Error in removeConnection: ", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getConnectionStatus = async (req, res) => {
  const targetId = req.params.userId;
  const currentUserId = req.user._id;
  try {
    const currentUser = req.user;

    if (currentUser.connections.includes(targetId)) {
      return res.status(200).json({ status: "connected" });
    }

    // Check if there is a pending connection request
    // from the current user to the target user
    // or from the target user to the current user
    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetId },
        { sender: targetId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.status(200).json({ status: "pending" });
      } else {
        return res
          .status(200)
          .json({ status: "received", requestId: pendingRequest._id });
      }
    }

    // if no connection or pending request found
    res.status(200).json({ status: "not_connected" });
  } catch (error) {
    console.log("Error in getConnectionStatus: ", error);
    return res.status(500).json({ message: error.message });
  }
};
