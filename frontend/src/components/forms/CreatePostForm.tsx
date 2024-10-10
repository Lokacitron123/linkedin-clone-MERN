import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { createPostSchema } from "./zod.schemas";
import { useMutation } from "@tanstack/react-query";
import { CreatePostData } from "./data.types";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Image, Loader } from "lucide-react";

export type CreatePostFields = z.infer<typeof createPostSchema>;

export const CreatePostForm = () => {
  const [imagePreview, setImagePreview] = useState<any>(null);

  const {
    register,
    setValue,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFields>({ resolver: zodResolver(createPostSchema) });

  const { mutate: CreatePostMutation } = useMutation({
    mutationFn: async (postData: CreatePostData) => {
      console.log("logging postData", postData);

      const res = await axiosInstance.post("/posts/create", postData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return res.data;
    },
    onSuccess: () => {
      reset();
      setImagePreview(null);
      toast.success("Post created successfully");
    },
    onError: (error: AxiosError) => {
      toast.error(error.response?.data.message || "Failed to create post");
    },
  });

  const onSubmit: SubmitHandler<CreatePostFields> = async (data) => {
    console.log("Submit triggered!");
    console.log("Full form data from watch() inside onSubmit: ", watch());
    try {
      CreatePostMutation(data);
    } catch (error) {
      console.error("Error in handlePostCreation", error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];

    if (file) {
      const image = await readFileAsDataURL(file);
      console.log("logging iamge after readfile: ", image);
      setValue("image", image); // Update the form value with the selected image(file);
    }

    console.log(
      "Full form data from watch() inside handleImageChange:",
      watch()
    );
    if (file) {
      readFileAsDataURL(file).then(setImagePreview);
    } else {
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      {/* Content */}
      <div>
        <label className='label'>
          What's on your mind? Share your thoughts...
        </label>
        <textarea
          {...register("content")}
          placeholder='Content...'
          className='w-full p-1 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]'
        />
      </div>
      {errors.content && <p>{errors.content.message}</p>}

      {/* Image preview */}
      {imagePreview && (
        <div className='mt-4'>
          <img
            src={imagePreview}
            alt='Selected'
            className='w-full h-auto rounded-lg'
          />
        </div>
      )}

      {/* Image selection */}
      <div className='flex justify-between items-center mt-4'>
        <div className='flex space-x-4'>
          <label className='flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer'>
            <Image size={20} className='mr-2' />
            <span>Photo</span>
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleImageChange}
            />
          </label>
        </div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors duration-200'
        >
          {isSubmitting ? <Loader className='w-4 h-4 animate-spin' /> : "Share"}
        </button>
      </div>
    </form>
  );
};
