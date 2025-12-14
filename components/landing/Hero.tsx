import Link from "next/link";

export default function Hero() {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 relative bg-background">
            <div className="w-full max-w-4xl text-center z-10 relative">
                <h1 className="font-serif text-[12vw] md:text-[8vw] leading-[0.9] tracking-tight text-foreground mb-8">
                    IN-CREATION
                </h1>
                <p className="font-sans text-lg md:text-xl text-stone font-light tracking-wide uppercase mb-12">
                    Process. Not results.
                </p>

                <div className="flex flex-col items-center gap-4 relative z-50">
                    <Link
                        href="/login"
                        className="px-8 py-3 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors tracking-wide shadow-lg"
                    >
                        Enter Studio
                    </Link>
                    <p className="text-xs text-stone tracking-widest uppercase mt-4 opacity-50">
                        Members Only
                    </p>
                </div>
            </div>
        </section>
    );
}
