"use client";

import React from "react";
import { useThemeTokens } from "../ThemeContext";

export interface AppShellProps {
  topBar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ topBar, children }: AppShellProps) {
  const theme = useThemeTokens();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {topBar}
      <div style={{ padding: theme.spacing.xl }}>{children}</div>
    </div>
  );
}


