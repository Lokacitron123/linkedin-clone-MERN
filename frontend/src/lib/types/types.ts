export interface Experience {
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date; // Optional if the user hasn't left the job yet
  description?: string;
}

export interface Education {
  school: string;
  degree: string;
  startYear: number;
  endYear?: number; // Optional if the user is still studying
}

export interface User {
  _id: string; // For ObjectId
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bannerImg?: string;
  headline?: string;
  location?: string;
  about?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  connections: string[]; // List of user ids
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  content: string;
  user: string; // User ID
  createdAt: Date;
}

export interface Post {
  _id: string; // For ObjectId
  author: User; // User ID
  content?: string;
  image?: string;
  likes: string[]; // List of user ids
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = "like" | "comment" | "connectionAccepted";

export interface Notification {
  _id: string; // For ObjectId
  recipient: string; // User ID
  type: NotificationType;
  relatedUser?: string; // User ID
  relatedPost?: string; // Post ID
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface ConnectionRequest {
  _id: string; // For ObjectId
  sender: string; // User ID
  recipient: string; // User ID
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}
