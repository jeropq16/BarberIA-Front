"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";

interface LoginForm {
    email: string;
    password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2070&auto=format&fit=crop";

export default function LoginPage() {
  const router = useRouter();
  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOGIN NORMAL
  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setError("Credenciales incorrectas");
        return;
      }

      const result = await res.json();
      localStorage.setItem("token", result.token);
      router.push("/appoinment");
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // LOGIN GOOGLE
  const onGoogleLoginSuccess = async (response: any) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: response.credential,
          }),
        }
      );

      if (!res.ok) {
        setError("Error al iniciar sesión con Google");
        return;
      }

      const result = await res.json();
      localStorage.setItem("token", result.token);
      router.push("/appoinment");
    } catch {
      setError("No se pudo conectar con Google");
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const onRegister = async (data: RegisterForm) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setError("No se pudo registrar");
        return;
      }

      setSuccess("Registro exitoso, ahora inicia sesión");
      setIsRegister(false);
      registerForm.reset();
    } catch {
      setError("Error al conectar con el servidor");
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
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h1>

        <AnimatePresence mode="wait">
          {!isRegister ? (
            <motion.form
              key="login"
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
                className="w-full py-3 rounded-xl bg-red-600 font-semibold"
              >
                {loading ? "Ingresando..." : "Entrar"}
              </button>

              {/* DIVISOR */}
              <div className="my-3 flex items-center gap-2 text-gray-400">
                <div className="flex-1 h-px bg-gray-600" />
                <span className="text-xs">O</span>
                <div className="flex-1 h-px bg-gray-600" />
              </div>

              {/* BOTÓN GOOGLE */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleLoginSuccess}
                  onError={() => setError("Google falló")}
                  theme="filled_black"
                  shape="pill"
                />
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              onSubmit={registerForm.handleSubmit(onRegister)}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Nombre"
                {...registerForm.register("name")}
                className="w-full p-3 rounded-xl bg-black/80 text-white border border-red-700"
                required
              />

              <input
                type="email"
                placeholder="Correo"
                {...registerForm.register("email")}
                className="w-full p-3 rounded-xl bg-black/80 text-white border border-red-700"
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                {...registerForm.register("password")}
                className="w-full p-3 rounded-xl bg-black/80 text-white border border-red-700"
                required
              />

              <button
                disabled={loading}
                className="w-full py-3 rounded-xl bg-red-600 font-semibold"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && <p className="text-red-400 text-center mt-3">{error}</p>}
        {success && <p className="text-green-400 text-center mt-3">{success}</p>}

        <p className="text-center text-sm mt-4 text-gray-300">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setError("");
              setIsRegister(!isRegister);
            }}
            className="text-red-500 underline ml-1"
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
