import { AxiosError } from "axios";
import { Eye, EyeOff, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginSchema } from "./zod.schemas";
import { LoginData } from "./data.types";

export type LoginFormFields = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormFields>({ resolver: zodResolver(loginSchema) });

  const { mutate: loginMutation } = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await axiosInstance.post("/auth/login", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: AxiosError) => {
      if (error.response) {
        // Access error.response.data.message if it exists
        toast.error(error.response.data.message || "Something vent wrong");
      } else {
        // Handle network or other errors
        toast.error("An unexpected error occurred");
      }
    },
  });

  const onSubmit: SubmitHandler<LoginFormFields> = (data) => {
    const { username, password } = data;

    loginMutation({ username, password });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
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

      {/* Submit Button */}
      <div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='btn btn-primary w-full mt-4'
        >
          {isSubmitting ? <Loader className='w-4 h-4 animate-spin' /> : "Login"}
        </button>
      </div>
    </form>
  );
};
