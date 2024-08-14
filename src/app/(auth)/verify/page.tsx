"use client";

import { sendMail } from "@/lib/nodeMailer/mailer";
import { createClient } from "@/lib/supabase/client";
import { createClient as userInfo } from "@/lib/supabase/client";
import { redirect, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import { verificationUpdate } from "@/lib/supabase/adminFunc";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Popup from "@/components/popup";

const VerifyOTP = () => {
  const router = useRouter();
  const supabase = createClient();
  const [inputOTP, setInputOTP] = useState(false);
  const [OTP, setOTP] = useState("");
  const [data, setData] = useState();
  const [wrongOTP, setWrongOTP] = useState(false);
  useEffect(() => {
    const action = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.log(error, data);
      }
      setData(data);
      console.log(data.user?.user_metadata);

      if (data.user?.user_metadata.email_verified) {
        router.push("/dashboard");
        return;
      }
    };
    action();
  }, []);

  const verifyMail = async () => {
    console.log(data);
    if (data.user) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const OTPstr = String(otp);
      const salt = await bcrypt.genSalt(7);
      const hashedOTP = await bcrypt.hash(OTPstr, salt);
      Cookies.set("otp", hashedOTP);
      const res = await sendMail({ email: data.user.email || "", otp: otp });
      console.log(res);
      setInputOTP(true);
    }
  };
  const verify = async () => {
    const cotp = Cookies.get("otp");
    if (cotp) {
      const check = await bcrypt.compare(OTP, cotp);
      console.log(check);

      const { data, error } = await supabase.auth.getUser();
      console.log(data.user);
      const userId = data.user?.id || "";
      await verificationUpdate(userId);
      Cookies.remove("otp");
      if (check) {
        router.push("/profileSetup");
      } else {
        setWrongOTP(true);
        setTimeout(() => {
          setWrongOTP(false);
        }, 3500);
        setInputOTP(false);
      }
    }
  };
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="flex flex-col text-3xl">
        {wrongOTP ? (
          <>
            <Popup error={true} message="wrong OTP" />
          </>
        ) : (
          <></>
        )}
        <button
          className="rounded-md p-4 bg-white/25 duration-300"
          onClick={() => {
            verifyMail();
          }}
        >
          Send OTP
        </button>
        {inputOTP ? (
          <div className="mt-5 flex flex-col justify-center items-center">
            <InputOTP
              maxLength={6}
              value={OTP}
              onChange={(value) => setOTP(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <button
              className="rounded-md hover:bg-white/25 duration-300 p-3 m-1"
              onClick={() => {
                verify();
              }}
            >
              Submit
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;
