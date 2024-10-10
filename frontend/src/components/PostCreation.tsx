import React from "react";
import { User } from "../lib/types/types";
import { CreatePostForm } from "./forms/CreatePostForm";

interface PostCreationProps {
  user: User | undefined;
}

export const PostCreation = ({ user }: PostCreationProps) => {
  return (
    <div className='bg-secondary rounded-lg shadow mb-4 p-4'>
      <div className='flex space-x-3 '>
        <img
          src={user?.profilePicture || "/avatar.png"}
          alt={
            user?.name ? `${user?.name}'s profile picture` : "profile picture"
          }
          className='w-12 h-12 rounded-full'
        />
        <div className='w-full'>
          <CreatePostForm />
        </div>
      </div>
    </div>
  );
};
