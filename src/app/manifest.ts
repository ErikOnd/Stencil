import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Stencil",
		short_name: "Stencil",
		description: "Personal prompt-management library.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#fffdf7",
		theme_color: "#fffdf7",
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/pwa-icon.png",
				sizes: "1024x1024",
				type: "image/png",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
