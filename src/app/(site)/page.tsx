"use client";
import TitleSection from "@/components/landing-page/title-section";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

const HomePage = () => {
  const supabase = createClient();
  const [showEmail, setShow] = useState(false);
  const [data, setData] = useState([]);
  useEffect(() => {
    const func = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user.email) {
        // redirect('/login')
        console.log(error);
      }
      setData(data);
      setShow(true);
      console.log(data.session?.user.email);
    };
    func();
  }, []);
  return (
    <div>
      <TitleSection title="pls work" subHeading="should work" />

      {showEmail ? <h1>{data.session?.user.email}</h1> : <>loading</>}
    </div>
  );
};

export default HomePage;
