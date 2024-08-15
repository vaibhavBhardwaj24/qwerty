"use client";
import TitleSection from "@/components/landing-page/title-section";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Session, AuthError } from "@supabase/supabase-js"; // Import necessary types

interface SupabaseAuthResponse {
  data: {
    session: Session | null;
  };
  error: AuthError | null;
}

const HomePage: React.FC = () => {
  const supabase = createClient();
  const [showEmail, setShow] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null); // Changed to store email directly

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error }: SupabaseAuthResponse =
        await supabase.auth.getSession();

      if (error || !data.session?.user.email) {
        // Redirect to login page if there is an error or no email is found
        console.log(error);
        redirect("/login"); // Uncomment this line if you want to perform redirection
        return;
      }

      setEmail(data.session.user.email);
      setShow(true);
      console.log(data.session.user.email);
    };

    fetchSession();
  }, [supabase]);

  return (
    <div>
      <TitleSection title="Welcome" subHeading="Check your email" />
      {showEmail ? <h1>{email}</h1> : <p>Loading...</p>}
    </div>
  );
};

export default HomePage;
