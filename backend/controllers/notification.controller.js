import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
  const userId = req.user._id;

  try {
    const notifications = await Notification.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getUserNotifications: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const notificationId = req.params.id;

  try {
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId },
      { read: true },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    console.error("Error in markNotificationAsRead: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteNotification = async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user._id;

  try {
    await Notification.findByIdAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotification: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
