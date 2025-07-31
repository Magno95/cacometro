// actions/admin-login.ts
"use server";

import { cookies } from "next/headers";
import { validateAdminPassword } from "@/lib/auth-server";

export async function adminLoginAction({ password }: { password: string }) {
  try {
    await validateAdminPassword(password);

    // Se valida, salva un cookie di sessione
    (await cookies()).set("admin_logged_in", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6 // 6 ore
    });

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: "Password errata"
    };
  }
}
