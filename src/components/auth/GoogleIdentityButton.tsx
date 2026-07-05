"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: {
						client_id: string;
						callback: (response: { credential?: string }) => void;
						nonce?: string;
					}) => void;
					renderButton: (
						parent: HTMLElement,
						options: {
							type?: "standard" | "icon";
							theme?: "outline" | "filled_blue" | "filled_black";
							size?: "large" | "medium" | "small";
							text?: "signin_with" | "signup_with" | "continue_with" | "signin";
							shape?: "rectangular" | "pill" | "circle" | "square";
							logo_alignment?: "left" | "center";
							width?: number;
						},
					) => void;
				};
			};
		};
	}
}

let googleIdentityScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("Google sign-in is only available in the browser."));
	}

	if (window.google?.accounts?.id) {
		return Promise.resolve();
	}

	if (!googleIdentityScriptPromise) {
		googleIdentityScriptPromise = new Promise<void>((resolve, reject) => {
			const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`);
			if (existing) {
				existing.addEventListener("load", () => resolve(), { once: true });
				existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in script.")), {
					once: true,
				});
				return;
			}

			const script = document.createElement("script");
			script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error("Failed to load Google sign-in script."));
			document.head.appendChild(script);
		});
	}

	return googleIdentityScriptPromise;
}

type GoogleIdentityButtonProps = {
	className?: string;
	disabled?: boolean;
	onCredential: (idToken: string, nonce: string) => Promise<void>;
	onError: (message: string) => void;
	children: ReactNode;
};

function createRawNonce() {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashNonce(nonce: string) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(nonce));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function GoogleIdentityButton({
	className,
	disabled = false,
	onCredential,
	onError,
	children,
}: GoogleIdentityButtonProps) {
	const mountRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<(() => void) | null>(null);
	const setupErrorRef = useRef("");

	const triggerGoogleSignIn = useCallback(() => {
		if (disabled) return;
		const trigger = triggerRef.current;
		if (!trigger) {
			onError(setupErrorRef.current || "Google sign-in is not ready yet. Please try again.");
			return;
		}
		trigger();
	}, [disabled, onError]);

	useEffect(() => {
		if (disabled) {
			triggerRef.current = null;
			return;
		}

		const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
		if (!googleClientId) {
			triggerRef.current = null;
			setupErrorRef.current = "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID. Add it to your environment and restart the app.";
			return;
		}

		let cancelled = false;
		setupErrorRef.current = "";
		const nonce = createRawNonce();

		void (async () => {
			try {
				const hashedNonce = await hashNonce(nonce);
				await loadGoogleIdentityScript();
				if (cancelled || !mountRef.current) return;

				const googleIdentity = window.google?.accounts?.id;
				if (!googleIdentity) {
					setupErrorRef.current = "Google sign-in is unavailable.";
					return;
				}

				googleIdentity.initialize({
					client_id: googleClientId,
					nonce: hashedNonce,
					callback: async ({ credential }) => {
						if (!credential) {
							onError("Google sign-in failed. Missing identity token.");
							return;
						}
						await onCredential(credential, nonce);
					},
				});

				mountRef.current.innerHTML = "";
				const width = Math.max(220, Math.floor(mountRef.current.getBoundingClientRect().width || 320));
				googleIdentity.renderButton(mountRef.current, {
					type: "standard",
					theme: "outline",
					size: "large",
					text: "continue_with",
					shape: "rectangular",
					logo_alignment: "left",
					width,
				});

				const button = mountRef.current.querySelector<HTMLElement>("[role='button'], div[tabindex='0']");
				triggerRef.current = button ? () => button.click() : null;
			} catch (error) {
				triggerRef.current = null;
				setupErrorRef.current = error instanceof Error ? error.message : "Failed to initialize Google sign-in.";
			}
		})();

		return () => {
			cancelled = true;
			triggerRef.current = null;
		};
	}, [disabled, onCredential, onError]);

	return (
		<>
			<button className={className} disabled={disabled} onClick={triggerGoogleSignIn} type="button">
				{children}
			</button>
			<div
				ref={mountRef}
				aria-hidden="true"
				style={{
					position: "absolute",
					width: 1,
					height: 1,
					overflow: "hidden",
					clipPath: "inset(50%)",
					whiteSpace: "nowrap",
				}}
			/>
		</>
	);
}
