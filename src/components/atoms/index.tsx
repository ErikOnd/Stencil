import clsx from "clsx";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import badgeStyles from "./Badge.module.scss";
import buttonStyles from "./Button.module.scss";
import checkboxStyles from "./Checkbox.module.scss";
import chipStyles from "./Chip.module.scss";
import fieldStyles from "./Field.module.scss";
import { Icon, type IconName } from "./Icon";
import iconButtonStyles from "./IconButton.module.scss";
import modalStyles from "./Modal.module.scss";
import toggleStyles from "./Toggle.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "sage" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  icon?: IconName;
  loading?: boolean;
};

export function Button({ variant = "secondary", size = "medium", icon, loading, className, children, ...props }: ButtonProps) {
  return (
    <button className={clsx(buttonStyles.button, buttonStyles[variant], buttonStyles[size], className)} {...props}>
      {loading ? <span className={buttonStyles.spinner} /> : icon ? <Icon name={icon} size={15} /> : null}
      {children}
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: FieldProps) {
  return (
    <label className={fieldStyles.fieldWrap}>
      {label ? <span className={fieldStyles.label}>{label}</span> : null}
      <input className={clsx(fieldStyles.field, error && fieldStyles.fieldError, className)} {...props} />
      {error ? <span className={fieldStyles.errorText}>{error}</span> : null}
    </label>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <label className={fieldStyles.fieldWrap}>
      {label ? <span className={fieldStyles.label}>{label}</span> : null}
      <textarea className={clsx(fieldStyles.field, fieldStyles.textarea, error && fieldStyles.fieldError, className)} {...props} />
      {error ? <span className={fieldStyles.errorText}>{error}</span> : null}
    </label>
  );
}

export function Chip({ active, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button className={clsx(chipStyles.chip, active && chipStyles.chipActive)} type="button" {...props}>
      {children}
    </button>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className={chipStyles.monoPill}>{children}</span>;
}

export function Toggle({ checked, onClick, "aria-label": label = "Toggle" }: { checked: boolean; onClick: () => void; "aria-label"?: string }) {
  return (
    <button className={clsx(toggleStyles.toggle, checked && toggleStyles.toggleOn)} type="button" onClick={onClick} aria-label={label}>
      <span className={toggleStyles.toggleKnob} />
    </button>
  );
}

export function Checkbox({ checked, onClick, className }: { checked: boolean; onClick: () => void; className?: string }) {
  return (
    <button className={clsx(checkboxStyles.checkbox, checked && checkboxStyles.checkboxChecked, className)} type="button" onClick={onClick}>
      {checked ? "✓" : ""}
    </button>
  );
}

export function IconButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(iconButtonStyles.iconButton, className)} type="button" {...props}>
      {children}
    </button>
  );
}

export function Modal({ children, width = 460 }: { children: ReactNode; width?: number }) {
  return (
    <div className={modalStyles.modalBackdrop}>
      <div className={modalStyles.modalCard} style={{ width }}>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className={badgeStyles.badge}>{children}</span>;
}

export { Icon };
