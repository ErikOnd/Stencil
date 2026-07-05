import { AuthForm } from "./AuthForm";
import { AuthLayout } from "./AuthLayout";

export function AuthPage({
  layout = "Centered",
  defaultMode = "signin",
}: {
  layout?: "Split" | "Centered";
  defaultMode?: "signin" | "register";
}) {
  return (
    <AuthLayout layout={layout}>
      <AuthForm defaultMode={defaultMode} />
    </AuthLayout>
  );
}
