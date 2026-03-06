import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { HeroUIProviderWrapper } from "@/components/HeroUIProviderWrapper";

export const metadata: Metadata = {
  title: "Campus-for-Hire | AI-Powered Placement Prep",
  description:
    "Personalized, AI-driven campus placement preparation platform for Indian students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased"
        style={
          {
            "--font-poppins": "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            "--font-jetbrains-mono": "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
            "--font-playfair": "'Playfair Display', Georgia, 'Times New Roman', serif",
          } as React.CSSProperties
        }
      >
        <HeroUIProviderWrapper>
          <AuthProvider>{children}</AuthProvider>
        </HeroUIProviderWrapper>
      </body>
    </html>
  );
}
