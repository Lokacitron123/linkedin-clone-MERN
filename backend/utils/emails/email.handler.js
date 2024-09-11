import { mailtrapClient, sender } from "../../lib/mailtrap.js";
import { createWelcomeEmailTemplate } from "./email.template.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to Linkedin Clone",
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: "welcome",
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    throw new Error("Error sending welcome email", error);
  }
};
