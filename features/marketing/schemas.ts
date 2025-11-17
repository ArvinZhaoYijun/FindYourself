import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string({ required_error: "Please enter your name" })
    .min(1, "Please enter your name"),
  email: z
    .string({ required_error: "Please enter email" })
    .email("Please enter valid email")
    .min(1, "Please enter email"),
  company: z
    .string({ required_error: "Please enter your company's name" })
    .min(1, "Please enter your company's name"),
  message: z
    .string({ required_error: "Please enter your message" })
    .min(1, "Please enter your message"),
});

export type ContactInput = z.infer<typeof contactSchema>;
