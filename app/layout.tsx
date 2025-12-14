import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';


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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${fraunces.variable} font-sans bg-background text-foreground antialiased selection:bg-accent selection:text-background`}>
                {children}
            </body>
        </html>
    );
}
