"use server";
import nodemailer from "nodemailer";
import EmailTemplate from "./emailTemplate";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bhardwajvaibhav2412@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});
export const inviteMail = async ({
  email,
  workspaceId,
  userId,
//   title,
}: {
  email: string;
  workspaceId: string;
  userId: string;
//   title: string;
}) => {
  const info = await transporter.sendMail({
    to: email,
    subject: "Enter your OTP",
    text: "enter this otp",
    html: `<h1>you are invited to </h1>
    <a href="http://localhost:3000/invite?workspaceId=${workspaceId}&userId=${userId}">click here</a>
    `,
  });
  return info;
};
