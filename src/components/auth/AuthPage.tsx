import { AuthForm } from "./AuthForm";
import { AuthLayout } from "./AuthLayout";

export function AuthPage({
	layout = "Centered",
	defaultMode = "signin",
	errorMessage = "",
}: {
	layout?: "Split" | "Centered";
	defaultMode?: "signin" | "register";
	errorMessage?: string;
}) {
	return (
		<AuthLayout layout={layout}>
			<AuthForm defaultMode={defaultMode} initialError={errorMessage} />
		</AuthLayout>
	);
}
