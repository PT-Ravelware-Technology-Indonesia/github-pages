import type { Metadata } from "next";
import { appConfig } from "@/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${appConfig.departmentName} Portal`,
  description: `Official internal portal for the ${appConfig.departmentName} department.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
