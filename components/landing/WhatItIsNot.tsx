"use client";

import { motion } from "framer-motion";

const features = [
    "No public like counts.",
    "No follower numbers.",
    "No algorithmic feed.",
    "No ads.",
    "No distraction."
];

export default function WhatItIsNot() {
    return (
        <section className="min-h-[50vh] flex items-center justify-center p-8 bg-paper">
            <div className="max-w-3xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-3xl md:text-5xl text-stone mb-12"
                >
                    Not a popularity contest.
                </motion.h2>

                <ul className="space-y-4">
                    {features.map((feature, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="font-sans text-xl md:text-2xl text-foreground font-light"
                        >
                            {feature}
                        </motion.li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
