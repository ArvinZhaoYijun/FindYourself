import { z } from "zod";

const email = z
  .string({ required_error: "Please enter email" })
  .email("Please enter valid email")
  .min(1, "Please enter email");

const password = z
  .string({ required_error: "Please enter password" })
  .min(1, "Please enter password");

export const loginSchema = z.object({
  email,
  password,
});

export const signupSchema = z.object({
  name: z
    .string({ required_error: "Please enter your name" })
    .min(1, "Please enter your name"),
  email,
  password,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
