import { FormFields } from "./SignUpForm";

export type SignUpData = Omit<FormFields, "confirmPassword">;
