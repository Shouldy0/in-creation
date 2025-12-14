import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Response from "@/components/landing/Response";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatItIsNot from "@/components/landing/WhatItIsNot";
import WhoItIsFor from "@/components/landing/WhoItIsFor";
import AIButHuman from "@/components/landing/AIButHuman";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
            <Hero />
            <Problem />
            <Response />
            <HowItWorks />
            <WhatItIsNot />
            <WhoItIsFor />
            <AIButHuman />
            <FinalCTA />
        </main>
    );
}
