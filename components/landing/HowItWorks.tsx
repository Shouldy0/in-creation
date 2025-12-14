"use client";

import { motion } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Document",
        description: "Share the messy middle. Sketches, drafts, wrong turns. The reality of your work."
    },
    {
        number: "02",
        title: "Exchange",
        description: "Receive constructive feedback. Give it in return. Grow through conversation, not validation."
    },
    {
        number: "03",
        title: "Reflect",
        description: "Engage with your Creative Mentor to unblock your path and deepen your understanding."
    }
];

export default function HowItWorks() {
    return (
        <section className="min-h-screen flex flex-col justify-center p-8 md:p-16 bg-background">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="font-serif text-3xl md:text-4xl text-stone mb-16 md:mb-24 text-center md:text-left"
            >
                How it works
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        className="space-y-4"
                    >
                        <span className="font-serif text-6xl md:text-7xl text-ink font-light block mb-6">
                            {step.number}
                        </span>
                        <h3 className="font-serif text-2xl text-foreground">
                            {step.title}
                        </h3>
                        <p className="font-sans text-stone font-light leading-relaxed">
                            {step.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
