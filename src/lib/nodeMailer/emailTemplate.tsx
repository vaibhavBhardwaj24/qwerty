import React from "react";
interface verifyOTP {
  otp: number;
}
const EmailTemplate: React.FC<Readonly<verifyOTP>> = ({ otp }) => {
  return (
    <>
      <h1>welcome !</h1>
      <h2>OTP is {otp}</h2>
    </>
  );
};

export default EmailTemplate;
