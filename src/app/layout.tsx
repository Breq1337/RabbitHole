import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rabbit Hole — Search one thing. Lose yourself in everything.",
  description: "A cinematic knowledge exploration platform. Discover surprising connections between people, concepts, history, science, and culture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
