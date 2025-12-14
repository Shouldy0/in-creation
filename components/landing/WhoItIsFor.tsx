"use client";

import { motion } from "framer-motion";

export default function WhoItIsFor() {
    return (
        <section className="min-h-screen flex items-center justify-center p-8 bg-background">
            <div className="max-w-4xl mx-auto text-center space-y-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-4xl md:text-6xl text-foreground font-light leading-tight"
                >
                    For the serious artist.
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-sans text-lg md:text-xl text-stone font-light leading-relaxed max-w-2xl mx-auto"
                >
                    <p>
                        Whether you are a painter, writer, musician, or coder.
                        If you value the journey over the destination.
                        If you seek growth over validation.
                        If you are ready to be vulnerable.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
