
export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-background text-foreground min-h-screen selection:bg-stone selection:text-black">
            {children}
        </div>
    );
}
