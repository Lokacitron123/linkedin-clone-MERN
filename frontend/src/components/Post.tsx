import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Post as PostInterface, User } from "../lib/types/types";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Loader, Trash2 } from "lucide-react";

type PostProps = {
  post: PostInterface;
};

// TODO: Create Post component
// https://youtu.be/Ycg48pVp3SU?t=14734

export const Post = ({ post }: PostProps) => {
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery<User>({
    queryKey: ["authUser"],
  });

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const isOwner = authUser?._id === post.author?._id;
  const isLiked = post.likes.includes(authUser._id);

  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async () => axiosInstance.delete(`/posts/delete/${post._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: createComment, isPending: isCreatingComment } = useMutation({
    mutationFn: async () =>
      axiosInstance.post(`/posts/${post._id}/comment}`, {
        content: newComment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment created successfully");
    },
    onError: (error) => {
      toast.error(error?.response.data.message || "Failed to create comment");
    },
  });

  const { mutate: likePost, isPending: isLikingPost } = useMutation({
    mutationFn: async () => axiosInstance.patch(`/posts/${post._id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      return;
    }
    deletePost();
  };

  return (
    <div className='bg-secondary rounded-lg shadow mb-4'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <Link to={`/profile/${post.author?.username}`}>
            <img
              src={post.author?.profilePicture || "/avatar.png"}
              alt={post.author?.name}
              className='size-10 rounded-full mr-3'
            />
          </Link>

          <div>
            <Link to={`/profile/${post.author?.username}`}>
              <h3 className='font-semibold'>{post.author?.name}</h3>
            </Link>
            <p className='text-xs text-info'>{post.author.headline}</p>
            <p className='text-xs text-gray-500'>{/* TODO: Format date */}</p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDeletePost}
            className='text-red-500 hover:text-red-700'
          >
            {isDeletingPost ? (
              <Loader size={18} className='animate-spin' />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
