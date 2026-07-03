"use client";

import appleIcon from "../../../public/assets/icons/apple.svg";
import googleIcon from "../../../public/assets/icons/google.svg";
import clsx from "clsx";
import Image from "next/image";
import styles from "./SocialButtons.module.scss";

type SvgAsset = string | { src: string };

function iconUrl(asset: SvgAsset) {
  return typeof asset === "string" ? asset : asset.src;
}

export function SocialButtons({
  busy,
  social,
  onProvider,
}: {
  busy: boolean;
  social: "google" | "apple" | null;
  onProvider: (provider: "google" | "apple") => void;
}) {
  return (
    <div className={styles.socials}>
      <button
        className={clsx(styles.socialButton, styles.google)}
        disabled={busy}
        onClick={() => onProvider("google")}
        type="button"
        style={{ opacity: busy && social !== "google" ? 0.55 : 1 }}
      >
        {social === "google" ? (
          <span className={styles.spinDark} />
        ) : (
          <Image src={iconUrl(googleIcon)} alt="" width={18} height={18} unoptimized style={{ flexShrink: 0 }} />
        )}
        <span>{social === "google" ? "Connecting to Google…" : "Continue with Google"}</span>
      </button>
      <button
        className={clsx(styles.socialButton, styles.apple)}
        disabled={busy}
        onClick={() => onProvider("apple")}
        type="button"
        style={{ opacity: busy && social !== "apple" ? 0.55 : 1 }}
      >
        {social === "apple" ? (
          <span className={styles.spinLight} />
        ) : (
          <Image src={iconUrl(appleIcon)} alt="" width={17} height={17} unoptimized style={{ flexShrink: 0 }} />
        )}
        <span>{social === "apple" ? "Connecting to Apple…" : "Continue with Apple"}</span>
      </button>
    </div>
  );
}
