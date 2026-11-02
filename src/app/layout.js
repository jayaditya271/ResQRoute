import './globals.css';

/**
 * ResQRoute™ Viewport Configuration
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050505',
};

/**
 * ResQRoute™ Metadata Configuration
 * Author: Jayaditya
 */
export const metadata = {
  title: 'ResQRoute™ | Emergency Evacuation Route Analysis (Graph & BFS)',
  description:
    'Monochrome glassmorphic emergency evacuation route analysis platform using Graph Representation and Breadth-First Search (BFS) for architectural life-safety egress planning.',
  keywords: [
    'Emergency Evacuation',
    'Graph Representation',
    'BFS',
    'Breadth-First Search',
    'Glassmorphism',
    'Monochrome',
    'Life Safety',
    'Jayaditya',
    'Building Egress',
    'Next.js',
    'Tailwind CSS v4'
  ],
  authors: [{ name: 'Jayaditya' }],
  creator: 'Jayaditya',
  publisher: 'ResQRoute',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-[#050505] text-zinc-100 antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
