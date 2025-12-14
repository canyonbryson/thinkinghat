"use client";

import React from "react";
import { Card } from "../components/Card";
import { useThemeTokens } from "../ThemeContext";

export interface GameStageProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function GameStage({ header, children }: GameStageProps) {
  const theme = useThemeTokens();

  return (
    <div style={{ display: "grid", gap: theme.spacing.lg }}>
      {header ? <div>{header}</div> : null}
      <Card variant="elevated" padding="lg">
        {children}
      </Card>
    </div>
  );
}


