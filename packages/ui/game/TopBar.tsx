"use client";

import React from "react";
import { t } from "@thinkinghat/i18n";
import { useTheme } from "../ThemeContext";
import { Button } from "../components/Button";

export interface TopBarProps {
  title?: React.ReactNode;
  rightSlot?: React.ReactNode; // e.g. Clerk UserButton / SignOutButton
}

const styles: Array<"modern" | "arcade" | "paper" | "glass"> = [
  "modern",
  "arcade",
  "paper",
  "glass",
];

export function TopBar({ title, rightSlot }: TopBarProps) {
  const { theme, mode, style, toggleMode, setStyle } = useTheme();

  const nextStyle = styles[(styles.indexOf(style) + 1) % styles.length];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing.lg,
        padding: theme.spacing.lg,
        background: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.md,
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamilyHeading,
          fontWeight: theme.typography.weightBold,
          fontSize: theme.typography.fontSizeLg,
        }}
      >
        {title ?? t("mainTitle")}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
        <Button variant="secondary" onClick={toggleMode}>
          {t("theme")}: {mode === "dark" ? t("dark") : t("light")}
        </Button>
        <Button variant="secondary" onClick={() => setStyle(nextStyle)}>
          {t("style")}: {style}
        </Button>
        {rightSlot}
      </div>
    </div>
  );
}


