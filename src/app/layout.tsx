import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "آزمون تابعیت آلمان | Einbürgerungstest Trainer",
  description:
    "آمادگی برای آزمون تابعیت آلمان (Einbürgerungstest) با ۳۰۰ سؤال رسمی به زبان آلمانی، فارسی و انگلیسی.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
