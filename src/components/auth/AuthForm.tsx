"use client";

import { Button, Input } from "@/components/atoms";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./AuthForm.module.scss";
import { AuthSuccess } from "./AuthSuccess";
import { SocialButtons } from "./SocialButtons";

type Mode = "signin" | "register";

type Errors = {
	name?: string;
	email?: string;
	password?: string;
};

export function AuthForm({ defaultMode = "signin" }: { defaultMode?: Mode }) {
	const router = useRouter();
	const supabase = useMemo(() => createClient(), []);
	const [mode, setMode] = useState<Mode>(defaultMode);
	const [stage, setStage] = useState<"form" | "success">("form");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPw, setShowPw] = useState(false);
	const [social, setSocial] = useState<"google" | "apple" | null>(null);
	const [touched, setTouched] = useState(false);
	const [lastProvider, setLastProvider] = useState<"google" | "apple" | null>(null);
	const [serverError, setServerError] = useState("");

	const isRegister = mode === "register";
	const errors = touched ? validate(mode, name, email, password) : {};

	async function submit(event: React.FormEvent) {
		event.preventDefault();
		setTouched(true);
		setServerError("");
		const nextErrors = validate(mode, name, email, password);
		if (Object.keys(nextErrors).length > 0) return;

		const result = isRegister
			? await supabase.auth.signUp({
				email: email.trim(),
				password,
				options: { data: { first_name: name.trim() } },
			})
			: await supabase.auth.signInWithPassword({ email: email.trim(), password });

		if (result.error) {
			setServerError(result.error.message);
			return;
		}

		setStage("success");
		setLastProvider(null);
		window.setTimeout(() => router.refresh(), 900);
	}

	async function startOAuth(provider: "google" | "apple") {
		if (social) return;
		setSocial(provider);
		setLastProvider(provider);
		const callbackUrl = new URL("/auth/callback", window.location.origin);
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: callbackUrl.toString() },
		});
		if (error) {
			setSocial(null);
			setServerError(error.message);
		}
	}

	function toggleMode() {
		setMode((current) => (current === "signin" ? "register" : "signin"));
		setTouched(false);
		setPassword("");
		setShowPw(false);
		setServerError("");
	}

	if (stage === "success") {
		return (
			<AuthSuccess
				title={lastProvider ? "You’re in" : isRegister ? "Account created" : "Welcome back"}
				subtitle={lastProvider
					? `Signed in with ${lastProvider === "google" ? "Google" : "Apple"}. Taking you to your library…`
					: isRegister
					? "Your prompt library is ready. Taking you in…"
					: "Signing you in to your prompt library…"}
				onReset={() => {
					setStage("form");
					setMode("signin");
					setName("");
					setEmail("");
					setPassword("");
					setTouched(false);
					setSocial(null);
					setLastProvider(null);
				}}
			/>
		);
	}

	return (
		<div className={styles.form}>
			<h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
			<p className={styles.subheading}>
				{isRegister ? "Start building your prompt library." : "Sign in to your prompt library."}
			</p>

			<SocialButtons busy={!!social} social={social} onProvider={startOAuth} />

			<div className={styles.divider}>
				<span>or continue with email</span>
			</div>

			<form className={styles.emailForm} onSubmit={submit}>
				{isRegister
					? (
						<Input
							label="First name"
							value={name}
							onInput={(event) => setName(event.currentTarget.value)}
							placeholder="What should we call you?"
							error={errors.name}
						/>
					)
					: null}

				<Input
					label="Email"
					value={email}
					onInput={(event) => setEmail(event.currentTarget.value)}
					type="email"
					placeholder="you@example.com"
					error={errors.email}
				/>

				<div>
					<div className={styles.passwordHead}>
						<label>Password</label>
						<button className={styles.textButton} type="button" onClick={() => setShowPw((value) => !value)}>
							{showPw ? "Hide" : "Show"}
						</button>
					</div>
					<Input
						value={password}
						onInput={(event) => setPassword(event.currentTarget.value)}
						type={showPw ? "text" : "password"}
						placeholder={isRegister ? "At least 8 characters" : "Your password"}
						error={errors.password}
					/>
					{serverError ? <div className={styles.error}>{serverError}</div> : null}
				</div>

				<Button className={styles.submit} variant="primary" size="large" type="submit">
					{isRegister ? "Create account" : "Sign in"}
				</Button>
			</form>

			<div className={styles.modeSwitch}>
				{isRegister ? "Already have an account?" : "New to Stencil?"}{" "}
				<button onClick={toggleMode} type="button">
					{isRegister ? "Sign in" : "Create an account"}
				</button>
			</div>
		</div>
	);
}

function validate(mode: Mode, name: string, email: string, password: string) {
	const errors: Errors = {};
	if (mode === "register" && !name.trim()) errors.name = "Please enter your name.";
	if (!email.trim()) errors.email = "Email is required.";
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address.";
	if (!password) errors.password = "Password is required.";
	else if (mode === "register" && password.length < 8) errors.password = "Use at least 8 characters.";
	return errors;
}
