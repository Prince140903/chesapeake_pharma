import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env variables
const envFile = fs.readFileSync(".env", "utf8");
const envVars = Object.fromEntries(
  envFile
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    "869e6461-64c8-4523-9f6d-4329317ac1a3",
    {
      email: "chesapeakepharm@gmail.com",
      email_confirm: true,
      password: "phillip@123",
    }
  );

  if (error) {
    throw error;
  }

  console.log("Admin account updated:", data.user?.id);
  console.log("New Email:", data.user?.email);
}

main().catch((err) => {
  console.error("Error executing updateUserById:", err);
  process.exit(1);
});
