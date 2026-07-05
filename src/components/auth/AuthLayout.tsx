import { Icon } from "@/components/atoms";
import Image from "next/image";
import styles from "./AuthLayout.module.scss";

export function AuthLayout({
  layout,
  children,
}: {
  layout: "Split" | "Centered";
  children: React.ReactNode;
}) {
  return (
    <div className={styles.root}>
      {layout === "Split" ? (
        <aside className={styles.brand}>
          <div className={styles.orb} />
          <div className={styles.brandMark}>
            <Image src="/assets/stencil-logo-transparent.png" alt="Stencil" width={38} height={38} priority />
            <div className={styles.brandName}>Stencil</div>
          </div>

          <div className={styles.brandBody}>
            <h1>Save, refine and reuse every&nbsp;prompt.</h1>
            <p>Your personal prompt library — mark the parts that change as variables, and reuse them whenever you need.</p>

            <div className={styles.featureList}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <Icon name="variable" size={15} />
                </span>
                Reusable templates with typed variables
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <Icon name="sparkle" size={15} />
                </span>
                AI improvements for saved prompts
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <Icon name="copy" size={15} />
                </span>
                One-click copy of the finished prompt
              </div>
            </div>
          </div>

          <div className={styles.copyright}>© {new Date().getFullYear()} Stencil</div>
        </aside>
      ) : null}
      <main className={styles.main}>
        <div className={styles.formShell}>
          {layout === "Centered" ? (
            <div className={styles.centerMark}>
              <Image src="/assets/stencil-logo-transparent.png" alt="Stencil" width={62} height={62} priority />
              <div className={styles.centerName}>Stencil</div>
            </div>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
