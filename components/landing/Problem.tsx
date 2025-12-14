"use client";

import { motion } from "framer-motion";

export default function Problem() {
    return (
        <section className="min-h-screen flex items-center justify-center p-8 md:p-16 bg-background">
            <div className="max-w-2xl mx-auto text-center space-y-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-4xl md:text-6xl text-foreground font-light leading-tight"
                >
                    Creation has become performance.
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-sans text-lg md:text-xl text-stone font-light leading-relaxed space-y-6"
                >
                    <p>
                        We live in a world obsessed with finished results.
                        Likes, views, and followers have replaced the joy of exploration.
                        The pressure to publish keeps us stagnant, afraid to experiment.
                    </p>
                    <p>
                        We have forgotten how to play.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
