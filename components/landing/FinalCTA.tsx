"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FinalCTA() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStatus("success");
        setEmail("");
    };

    return (
        <section className="min-h-screen flex items-center justify-center p-8 bg-background relative">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md text-center space-y-12"
            >
                <h2 className="font-serif text-4xl md:text-5xl text-foreground font-light">
                    Join the movement.
                </h2>

                <AnimatePresence mode="wait">
                    {status === "success" ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-6 border border-zinc-800 bg-paper rounded-lg"
                        >
                            <p className="font-sans text-xl text-accent">
                                You are on the list.
                            </p>
                            <p className="font-sans text-sm text-stone mt-2">
                                We will be in touch soon.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full bg-transparent border-b border-stone py-4 text-center text-xl text-foreground placeholder:text-zinc-700 focus:outline-none focus:border-foreground transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="px-8 py-3 bg-foreground text-background font-sans font-medium rounded-full hover:bg-stone transition-colors disabled:opacity-50"
                            >
                                {status === "loading" ? "..." : "Request Early Access"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>

            <footer className="absolute bottom-8 w-full text-center">
                <p className="font-sans text-xs text-zinc-800 uppercase tracking-widest">
                    In-Creation © {new Date().getFullYear()}
                </p>
            </footer>
        </section>
    );
}
