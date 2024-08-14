'use server'
import nodemailer from "nodemailer";
import EmailTemplate from "./emailTemplate";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bhardwajvaibhav2412@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});
export const sendMail = async ({
  email,
  otp,
}: {
  email: string;
  otp: number;
}) => {
  const info = await transporter.sendMail({
    to: email,
    subject: "Enter your OTP",
    text: "enter this otp",
    html: `<h1>Here is your OTP ${otp}</h1>`,
  });
  return info;
};
