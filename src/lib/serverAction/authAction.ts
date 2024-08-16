"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const loginAction = async (datas: {
  email: string;
  password: string;
}) => {
  const supabase = createClient();

  const datab = {
    email: datas.email,
    password: datas.password,
  };

  const { data, error } = await supabase.auth.signInWithPassword(datab);

  if (error) {
    console.log(error);
    return { message: false };
  } else {
    return { message: true, data: data };
  }

  console.log(data);
};

export const SignUpAction = async (datas: {
  email: string;
  password: string;
}) => {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const datab = {
    email: datas.email,
    password: datas.password,
  };

  const { data, error } = await supabase.auth.signUp(datab);

  if (error) {
    // redirect("/error");
    console.log(error);
    if (error.status == 422) {
      return { success: false, message: error.message };
    }
  }

  console.log(data);
  revalidatePath("/", "layout");
  redirect("/verify");
};
export const profileSetup = async (info: {
  userId: string;
  full_name: string;
  avatar_url: string;
}) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .update({
      full_name: info.full_name,
      avatar_url: info.avatar_url,
      updated_at: Date.now(),
    })
    .eq("id", info.userId);
  if (error) {
    console.log(error);
    return "error error";
  }
  console.log(data);
  redirect("/dashboard");
};
