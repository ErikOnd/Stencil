import { themeVars } from "@/lib/stencil/theme";
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
    <div style={themeVars()}>
      <AuthLayout layout={layout}>
        <AuthForm defaultMode={defaultMode} />
      </AuthLayout>
    </div>
  );
}
