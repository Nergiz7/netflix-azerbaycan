import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'NETFLIX AZƏRBAYCAN — Azərbaycan kinosu', description: 'Azərbaycan kinosunun klassikləri və yeni filmləri üçün kəşf platforması.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="az"><body>{children}</body></html>; }
