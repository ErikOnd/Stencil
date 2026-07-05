import clsx from "clsx";
import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import backButtonStyles from "./BackButton.module.scss";
import badgeStyles from "./Badge.module.scss";
import buttonStyles from "./Button.module.scss";
import checkboxStyles from "./Checkbox.module.scss";
import chipStyles from "./Chip.module.scss";
import fieldStyles from "./Field.module.scss";
import glyphStyles from "./FieldTypeGlyph.module.scss";
import { Icon, type IconName } from "./Icon";
import iconButtonStyles from "./IconButton.module.scss";
import modalStyles from "./Modal.module.scss";
import spinnerStyles from "./Spinner.module.scss";
import toggleStyles from "./Toggle.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "sage" | "sageSolid" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  icon?: IconName;
  loading?: boolean;
};

export function Button({ variant = "secondary", size = "medium", icon, loading, className, children, ...props }: ButtonProps) {
  return (
    <button className={clsx(buttonStyles.button, buttonStyles[variant], buttonStyles[size], className)} type="button" {...props}>
      {loading ? <Spinner /> : icon ? <Icon name={icon} size={15} /> : null}
      {children}
    </button>
  );
}

export function BackButton({ children = "Back", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(backButtonStyles.backButton, className)} type="button" {...props}>
      <Icon name="chevronLeft" size={16} />
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

export function CloseButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <IconButton className={iconButtonStyles.closeButton} aria-label="Close" {...props}>
      ×
    </IconButton>
  );
}

export function Spinner({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return <span className={clsx(spinnerStyles.spinner, spinnerStyles[tone], className)} />;
}

export function FieldTypeGlyph({ multiline }: { multiline?: boolean }) {
  if (!multiline) return <span className={glyphStyles.line} />;
  return (
    <span className={glyphStyles.stack}>
      <span className={glyphStyles.line} />
      <span className={glyphStyles.line} />
    </span>
  );
}

export function Modal({ children, width }: { children: ReactNode; width?: number }) {
  return (
    <div className={modalStyles.modalBackdrop}>
      <div
        className={modalStyles.modalCard}
        style={width ? ({ "--modal-width": `${width}px` } as CSSProperties) : undefined}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return <div className={modalStyles.modalActions}>{children}</div>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className={badgeStyles.badge}>{children}</span>;
}

export { Icon };
