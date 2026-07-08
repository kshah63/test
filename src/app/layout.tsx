import type { Metadata } from "next";
import "./globals.css";
import TimezoneSync from "@/components/TimezoneSync";

export const metadata: Metadata = {
  title: "TinySteps — 10 minutes a day of brain-building play",
  description:
    "Daily 10-minute development activities for babies and kids from newborn to 6, matched to your child's age.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TimezoneSync />
        {children}
      </body>
    </html>
  );
}
