"use client";

import { motion } from "framer-motion";

export default function Response() {
    return (
        <section className="min-h-screen flex items-center justify-center p-8 bg-ink text-foreground">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-4xl md:text-5xl font-light leading-tight"
                >
                    A sanctuary for the unfinished.
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-sans text-lg text-stone font-light leading-relaxed space-y-6"
                >
                    <p>
                        ATELIER is a response to the noise. A space where the act of creating is valued more than the output.
                    </p>
                    <p>
                        No likes. No public metrics. No algorithm chasing.
                        Just you, your process, and a community of peers committed to growth.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
