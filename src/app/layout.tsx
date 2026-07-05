import clsx from "clsx";
import type { Metadata } from "next";
import type { Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.scss";

const hanken = Hanken_Grotesk({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	applicationName: "Stencil",
	title: "Stencil",
	description: "Personal prompt-management library.",
	manifest: "/manifest.webmanifest",
	appleWebApp: {
		capable: true,
		title: "Stencil",
		statusBarStyle: "default",
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.png", type: "image/png" },
			{ url: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
	},
};

export const viewport: Viewport = {
	themeColor: "#fffdf7",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={clsx(hanken.variable, jetbrains.variable)}>
			<body suppressHydrationWarning>{children}</body>
		</html>
	);
}
