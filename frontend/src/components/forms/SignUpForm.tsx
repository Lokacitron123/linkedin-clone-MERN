import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "./zod.schemas";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { SignUpData } from "./data.types";
import { AxiosError } from "axios";

export type FormFields = z.infer<typeof signUpSchema>;

export const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: signUpMutation } = useMutation({
    mutationFn: async (data: SignUpData) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: AxiosError) => {
      if (error.response) {
        // Access error.response.data.message if it exists
        toast.error(error.response.data.message || "Error creating account");
      } else {
        // Handle network or other errors
        toast.error("An unexpected error occurred");
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    const { name, email, username, password } = data;

    signUpMutation({ name, email, username, password });
  };

  // Toggle password eye icons
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  const toggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      {/* Name */}
      <div>
        <label className='label'>Full name</label>
        <input
          {...register("name")}
          placeholder='Full name'
          className='input input-bordered w-full'
        />
      </div>
      {errors.name && <p>{errors.name.message}</p>}

      {/* Email */}
      <div>
        <label className='label'>Email</label>
        <input
          {...register("email")}
          placeholder='Email'
          className='input input-bordered w-full'
        />
      </div>
      {errors.email && <p>{errors.email.message}</p>}

      {/* Username */}
      <div>
        <label className='label'>Username</label>
        <input
          {...register("username")}
          placeholder='Username'
          className='input input-bordered w-full'
        />
      </div>
      {errors.username && <p>{errors.username.message}</p>}

      {/* Password */}
      <div>
        <label className='label'>Password</label>
        <div className='relative'>
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder='Password (min 6 characters)'
            className='input input-bordered w-full'
          />
          <button
            type='button'
            onClick={togglePassword}
            className='absolute top-1/2 right-2 -translate-y-1/2'
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>
      </div>
      {errors.password && <p>{errors.password.message}</p>}

      {/* Confirm Password */}
      <div>
        <label className='label'>Confirm Password</label>
        <div className='relative'>
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder='Confirm Password'
            className='input input-bordered w-full'
          />
          <button
            type='button'
            onClick={toggleConfirmPassword}
            className='absolute top-1/2 right-2 -translate-y-1/2'
          >
            {showConfirmPassword ? <Eye /> : <EyeOff />}
          </button>
        </div>
      </div>
      {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}

      {/* Submit Button */}
      <div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='btn btn-primary w-full mt-4'
        >
          {isSubmitting ? (
            <Loader className='w-4 h-4 animate-spin' />
          ) : (
            "Sign Up"
          )}
        </button>
      </div>
    </form>
  );
};
