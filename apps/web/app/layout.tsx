import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AuthProvider } from "../components/auth-provider";

export const metadata: Metadata = {
  title: "LMS Tecnico",
  description: "Base profesional del LMS tecnico con simuladores virtuales.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
