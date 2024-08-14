import { defineConfig, type Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("db url not found");
}
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
export default defineConfig({
  schema: "./src/lib/supabase/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:process.env.NEXT_PUBLIC_SUPABASE_URL!,
    
    ssl: {
      rejectUnauthorized: false, // This line allows self-signed certificates
    },
  },
});
// import { defineConfig } from "drizzle-kit";
// import * as dotenv from "dotenv";
// dotenv.config({ path: ".env" });

// if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
//   console.log("db url not found");
// }

// console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

// export default defineConfig({
//   schema: "./src/lib/supabase/schema.ts",
//   out: "./migrations",
//   dialect: "postgresql",
//   dbCredentials: {
//     host: "aws-0-ap-south-1.pooler.supabase.com", // Replace with your Supabase host
//     database: "postgres", // Replace with your database name
//     port: 6543, // Replace with your database port
//     user: "postgres.anqrsvjrcsycmishpvpg", // Replace with your database user
//     password: "WFInK1hqXbBAsaRN", // Replace with your database password
//     ssl: {
//       rejectUnauthorized: false, // This line allows self-signed certificates
//     },
//   },
// });
