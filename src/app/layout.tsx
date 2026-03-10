import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
