"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

interface LoginForm {
    email: string;
    password: string;
}

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2070&auto=format&fit=crop";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const loginForm = useForm<LoginForm>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || "Credenciales incorrectas");
        return;
      }

      const result = await res.json();
      
      if (!result.token) {
        setError("Error: No se recibió el token de autenticación");
        return;
      }

      await login(result.token);
    } catch (error: any) {
      setError(error?.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLoginSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError("");

    try {
      if (!credentialResponse?.credential) {
        setError("Error: No se recibió el token de Google");
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        setError("Error: URL del API no configurada");
        setLoading(false);
        return;
      }

      const requestBody = {
        GoogleToken: credentialResponse.credential,
      };

      const res = await fetch(`${apiUrl}/auth/google/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: `Error ${res.status}: ${res.statusText}` };
        }
        
        let errorMessage = errorData.title || 
                          errorData.message || 
                          errorData.error || 
                          `Error ${res.status}: ${res.statusText}`;
        
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msg}`;
            })
            .join('; ');
          
          if (validationErrors) {
            errorMessage = `${errorMessage} (${validationErrors})`;
          }
        }
        
        if (errorMessage.includes("untrusted 'aud' claim")) {
          errorMessage = "Error de configuración del servidor. Por favor, contacta al administrador.";
        } else if (errorMessage.includes("InvalidJwtException")) {
          errorMessage = "El token de Google no es válido. Por favor, intenta de nuevo.";
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const result = await res.json();
      
      if (!result.token) {
        setError("Error: No se recibió el token de autenticación del servidor");
        setLoading(false);
        return;
      }

      await login(result.token);
    } catch (error: any) {
      let errorMessage = "No se pudo conectar con el servidor. Por favor, intenta de nuevo.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative p-8 rounded-2xl w-[380px] border border-red-700"
        style={{
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
        }}
      > 
        <div className="flex justify-center mb-4">
          <Image src="/logo blanco.png" alt="Logo" width={140} height={140} priority />
        </div>

        <h1 className="text-center text-red-500 text-2xl font-bold mb-4">
          Iniciar sesión
        </h1>

        <motion.form
          onSubmit={loginForm.handleSubmit(onLogin)}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Correo"
            {...loginForm.register("email")}
            className="w-full p-3 rounded-xl bg-black/80 text-white border border-red-700"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            {...loginForm.register("password")}
            className="w-full p-3 rounded-xl bg-black/80 text-white border border-red-700"
            required
          />

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-600 font-semibold disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>

          <div className="my-3 flex items-center gap-2 text-gray-400">
            <div className="flex-1 h-px bg-gray-600" />
            <span className="text-xs">O</span>
            <div className="flex-1 h-px bg-gray-600" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onGoogleLoginSuccess}
              onError={() => {
                setError("Error al autenticar con Google. Por favor, intenta de nuevo.");
                setLoading(false);
              }}
              theme="filled_black"
              shape="pill"
              useOneTap={false}
              auto_select={false}
            />
          </div>
        </motion.form>

        {error && <p className="text-red-400 text-center mt-3">{error}</p>}

        <p className="text-center text-sm mt-4 text-gray-300">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-red-500 underline ml-1">
            Regístrate
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
