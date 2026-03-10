import { ClerkProvider } from "@clerk/nextjs";
import { JetBrains_Mono } from "next/font/google";
import ConvexClientProvider from "./ConvexClientProvider";
import "./globals.css";

export const dynamic = "force-dynamic";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata = {
  title: "Dugout Intel",
  description: "Real-time coaching intelligence for youth baseball",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${jetbrains.variable}`}>
      <body className="font-mono antialiased">
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
