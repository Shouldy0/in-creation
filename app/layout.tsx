import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { createClient } from '@/utils/supabase/server';
import { checkObserverMode } from '@/utils/access';
import ObserverBanner from '@/components/ui/ObserverBanner';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-fraunces',
    axes: ['SOFT', 'WONK', 'opsz']
});

export const metadata: Metadata = {
    title: 'IN-CREATION',
    description: 'The social network for the creative process.',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let daysLeft = 0;
    if (user) {
        const status = await checkObserverMode(user.id);
        if (status.isObserver) {
            daysLeft = status.daysLeft;
        }
    }

    return (
        <html lang="en">
            <body className={`${inter.variable} ${fraunces.variable} font-sans bg-background text-foreground antialiased selection:bg-accent selection:text-background`}>
                {user && daysLeft > 0 && <ObserverBanner daysLeft={daysLeft} />}
                {children}
            </body>
        </html>
    );
}
