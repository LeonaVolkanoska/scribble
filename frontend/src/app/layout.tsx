import type { Metadata } from "next";
import "./globals.css"
export const metadata: Metadata = {
  title: "scribble.io",
  description: "Fun way to draw and guess with friends or sneaky links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
