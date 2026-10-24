import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chesapeake Pharma | Drug Delivery Consulting",
  description: "Strategic drug delivery insights, commercialization strategy, and private intelligence for pharmaceutical and biotech teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
