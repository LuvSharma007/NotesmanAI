import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NotesmanAI",
  description: "Your personal AI knowledge companion",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies()
  // const sessionToken = cookieStore.get("better-auth.session_data");
  // let decoder = null
  // if(sessionToken?.value && secret){
  //   try {
  //     decoder = jwt.verify(sessionToken.value, secret);
  //   } catch (err) {
  //     console.error("JWT verification failed", err);
  //   }
  // }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          
          <Navbar/>
          {children}
        <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
