"use client";

import React from "react";
import { t } from "@thinkinghat/i18n";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useThemeTokens } from "../ThemeContext";

export interface LobbyPlayer {
  id: string;
  userId?: string | null;
  displayName: string;
  role: "host" | "player" | "spectator";
  isReady?: boolean;
  isConnected?: boolean;
  score?: number;
}

export interface GameLobbyProps {
  roomCode: string;
  players: LobbyPlayer[];
  currentUserId?: string | null;
  canStart?: boolean;
  startDisabledReason?: string;
  onToggleReady?: (next: boolean) => void;
  onStart?: () => void;
}

export function GameLobby({
  roomCode,
  players,
  currentUserId,
  canStart = false,
  startDisabledReason,
  onToggleReady,
  onStart,
}: GameLobbyProps) {
  const theme = useThemeTokens();
  const me = players.find((p) => (p.userId ?? null) === (currentUserId ?? null));
  const isHost = me?.role === "host";

  return (
    <div style={{ display: "grid", gap: theme.spacing.lg }}>
      <Card variant="elevated" padding="lg">
        <div style={{ display: "flex", justifyContent: "space-between", gap: theme.spacing.lg }}>
          <div>
            <div style={{ fontSize: theme.typography.fontSizeSm, color: theme.colors.textMuted }}>
              {t("roomCode")}
            </div>
            <div style={{ fontSize: theme.typography.fontSize2xl, fontWeight: theme.typography.weightBold }}>
              {roomCode}
            </div>
          </div>

          {me && me.role !== "spectator" ? (
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
              <Button
                variant={me.isReady ? "secondary" : "primary"}
                onClick={() => onToggleReady?.(!me.isReady)}
              >
                {me.isReady ? t("ready") : t("notReady")}
              </Button>
              {isHost ? (
                <Button
                  variant="primary"
                  disabled={!canStart}
                  title={!canStart ? startDisabledReason : undefined}
                  onClick={onStart}
                >
                  {t("startGame")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <div style={{ fontSize: theme.typography.fontSizeLg, fontWeight: theme.typography.weightBold }}>
          {t("players")}
        </div>
        <div style={{ height: theme.spacing.md }} />
        <div style={{ display: "grid", gap: theme.spacing.sm }}>
          {players.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: theme.spacing.sm,
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderSubtle}`,
                background: theme.colors.surfaceAlt,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: theme.typography.weightMedium }}>{p.displayName}</div>
                <div style={{ fontSize: theme.typography.fontSizeSm, color: theme.colors.textMuted }}>
                  {p.role === "host" ? t("host") : p.role === "spectator" ? t("spectator") : t("player")}
                  {p.isConnected === false ? ` · ${t("disconnected")}` : ""}
                </div>
              </div>
              {p.role !== "spectator" ? (
                <div style={{ fontSize: theme.typography.fontSizeSm, color: theme.colors.textMuted }}>
                  {p.isReady ? t("ready") : t("notReady")}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


