"use client";

import { Spinner } from "@/components/atoms";
import { iconUrl } from "@/components/atoms/Icon";
import appleIcon from "../../../public/assets/icons/apple.svg";
import googleIcon from "../../../public/assets/icons/google.svg";
import clsx from "clsx";
import Image from "next/image";
import styles from "./SocialButtons.module.scss";

type Provider = "google" | "apple";

export function SocialButtons({
  busy,
  social,
  onProvider,
}: {
  busy: boolean;
  social: Provider | null;
  onProvider: (provider: Provider) => void;
}) {
  return (
    <div className={styles.socials}>
      <button
        className={clsx(styles.socialButton, styles.google, busy && social !== "google" && styles.dimmed)}
        disabled={busy}
        onClick={() => onProvider("google")}
        type="button"
      >
        {social === "google" ? (
          <Spinner tone="dark" />
        ) : (
          <Image className={styles.socialIcon} src={iconUrl(googleIcon)} alt="" width={18} height={18} unoptimized />
        )}
        <span>{social === "google" ? "Connecting to Google…" : "Continue with Google"}</span>
      </button>
      <button
        className={clsx(styles.socialButton, styles.apple, busy && social !== "apple" && styles.dimmed)}
        disabled={busy}
        onClick={() => onProvider("apple")}
        type="button"
      >
        {social === "apple" ? (
          <Spinner />
        ) : (
          <Image className={styles.socialIcon} src={iconUrl(appleIcon)} alt="" width={17} height={17} unoptimized />
        )}
        <span>{social === "apple" ? "Connecting to Apple…" : "Continue with Apple"}</span>
      </button>
    </div>
  );
}
