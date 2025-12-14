"use client";

import { motion } from "framer-motion";

export default function AIButHuman() {
    return (
        <section className="min-h-[50vh] flex items-center justify-center p-8 bg-ink">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="font-sans text-lg text-stone font-light leading-relaxed order-2 md:order-1"
                >
                    <p>
                        We use AI not to replace human creativity, but to nurture it.
                        Our AI Creative Mentor asks questions to help you unblock your thoughts.
                    </p>
                    <p className="mt-6">
                        It does not generate art. It does not write for you.
                        It simply listens and reflects, helping you find your own way.
                    </p>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-serif text-3xl md:text-5xl text-foreground font-light leading-tight order-1 md:order-2"
                >
                    Intelligence that respects your agency.
                </motion.h2>
            </div>
        </section>
    );
}
