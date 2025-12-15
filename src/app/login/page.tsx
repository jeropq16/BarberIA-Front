"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { register, handleSubmit } = useForm<LoginForm>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                setError("Usuario o contraseña incorrectos.");
                setLoading(false);
                return;
            }

            const result = await res.json();

            localStorage.setItem("token", result.token);
            router.push("/dashboard");


        } catch {
            setError("Error al conectar con el servidor");
        }

        setLoading(false);
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen"
            style={{
                background: "#000000",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="p-8 rounded-xl shadow-xl flex flex-col items-center"
                style={{
                    background: "#0a0a0a",
                    width: 380,
                    border: "2px solid #cc0000",
                }}
            >
                {/* LOGO DENTRO DE LA CARD */}
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={260}
                    height={130}
                    className="object-contain mb-4"
                    priority
                />

                <h1
                    className="text-center mb-6 font-bold"
                    style={{ color: "#ff0000", fontSize: "1.8rem" }}
                >
                    Iniciar Sesión
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">

                    {/* INPUT USUARIO */}
                    <motion.input
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        type="email"
                        placeholder="Usuario"
                        {...register("email")}
                        required
                        className="w-full p-3 text-white outline-none"
                        style={{
                            background: "#000000",
                            border: "2px solid #cc0000",
                            borderRadius: "12px",
                        }}
                    />

                    {/* INPUT PASSWORD */}
                    <motion.input
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        type="password"
                        placeholder="Contraseña"
                        {...register("password")}
                        required
                        className="w-full p-3 text-white outline-none"
                        style={{
                            background: "#000000",
                            border: "2px solid #cc0000",
                            borderRadius: "12px",
                        }}
                    />

                    {/* BOTÓN */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 font-bold text-white"
                        style={{
                            background: "#cc0000",
                            borderRadius: "12px",
                        }}
                    >
                        {loading ? "Ingresando..." : "Entrar"}
                    </motion.button>

                </form>

                {/* ERROR */}
                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-center font-semibold"
                        style={{ color: "#ff3333" }}
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
}
