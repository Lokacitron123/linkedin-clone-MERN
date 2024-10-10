import { CreatePostFields } from "./CreatePostForm";
import { LoginFormFields } from "./LoginForm";
import { FormFields } from "./SignUpForm";

export type SignUpData = Omit<FormFields, "confirmPassword">;
export type LoginData = LoginFormFields;
export type CreatePostData = CreatePostFields;
