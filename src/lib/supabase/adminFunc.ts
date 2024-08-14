'use server'
import { createClient } from "@supabase/supabase-js";
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL2!,
  process.env.SERVICE_ROLE_KEY!
);
export async function verificationUpdate(userId: string) {
  try {
    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { email_verified: true },
    });
    return data;
  } catch (error) {
    console.log(error);

    return error;
  }
}
