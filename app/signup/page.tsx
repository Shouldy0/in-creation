import AuthForm from '@/components/auth/AuthForm';
import Link from 'next/link';

export default function SignupPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="font-serif text-3xl text-accent">Join the Studio</h1>
                    <p className="text-stone">No metrics. Just process.</p>
                </div>

                <AuthForm view="signup" />

                <p className="text-center text-sm text-stone">
                    Already have an account?{' '}
                    <Link href="/login" className="text-foreground hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
