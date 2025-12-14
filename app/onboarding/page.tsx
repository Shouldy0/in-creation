import ProfileForm from '@/components/profile/ProfileForm';

export default function OnboardingPage() {
    return (
        <main className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto space-y-8 pt-12">
                <header className="space-y-2">
                    <h1 className="font-serif text-3xl md:text-4xl text-foreground">Welcome to the Studio</h1>
                    <p className="text-stone text-lg">Introduce yourself to the process.</p>
                </header>

                <ProfileForm />
            </div>
        </main>
    );
}
