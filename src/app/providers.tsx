"use client";

import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <AuthProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastClassName="bg-[#0a0a0a] border border-[#1a1a1a] text-white"
          progressClassName="bg-[#dc2626]"
        />
      </AuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        {children}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="dark"
          toastClassName="bg-[#0a0a0a] border border-[#1a1a1a] text-white"
          progressClassName="bg-[#dc2626]"
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
