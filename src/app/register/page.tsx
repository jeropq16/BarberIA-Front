"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2070&auto=format&fit=crop";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const registerForm = useForm<RegisterForm>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onRegister = async (data: RegisterForm) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || "No se pudo registrar");
        return;
      }

      const result = await res.json();

      if (result.token) {
        try {
          await login(result.token);
        } catch (loginError: any) {
          setError(loginError?.message || "Error al procesar la sesión");
        }
      } else {
        setSuccess("Registro exitoso, ahora inicia sesión");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error: any) {
      setError(error?.message || "Error al conectar con el servidor");
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
          Crear cuenta
        </h1>

        <motion.form
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
            className="w-full py-3 rounded-xl bg-red-600 font-semibold disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </motion.form>

        {error && <p className="text-red-400 text-center mt-3">{error}</p>}
        {success && <p className="text-green-400 text-center mt-3">{success}</p>}

        <p className="text-center text-sm mt-4 text-gray-300">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-red-500 underline ml-1">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

