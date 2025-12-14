"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@thinkinghat/backend/convex/_generated/api";
import type { Id } from "@thinkinghat/backend/convex/_generated/dataModel";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { AppShell, TopBar, GameLobby, GameStage, Card } from "@thinkinghat/ui";
import { computeCanStart } from "@thinkinghat/game-core";
import { t } from "@thinkinghat/i18n";
import { MumbledGameScreen } from "@/components/games/mumbled/MumbledGameScreen";
import { getOrCreateGuestIdentity } from "@/lib/guest";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toString().toUpperCase();

  const { user } = useUser();
  const [guest] = useState(() => getOrCreateGuestIdentity());
  const joinByCode = useMutation(api.players.joinByCode);
  const setReady = useMutation(api.players.setReady);
  const startRoom = useMutation(api.rooms.start);

  const room = useQuery(api.rooms.getByCode, { code });
  const roomId = (room?._id ?? null) as Id<"rooms"> | null;
  const players = useQuery(api.players.listByRoom, roomId ? { roomId } : "skip");

  useEffect(() => {
    if (!room) return;
    const displayName = user?.fullName ?? user?.username ?? guest.guestName;
    void joinByCode({
      code,
      displayName,
      guestId: user ? undefined : guest.guestId,
    });
  }, [user, room, code, joinByCode, guest.guestId, guest.guestName]);

  const me = useMemo(() => {
    if (!players) return null;
    if (user) return players.find((p) => p.userId === user.id) ?? null;
    return players.find((p) => (p as any).guestId === guest.guestId) ?? null;
  }, [players, user, guest.guestId]);

  const canStart = useMemo(() => {
    if (!room || !players) return { ok: false, reason: "Loading" };
    return computeCanStart(
      { mode: room.mode },
      players.map((p) => ({
        id: p._id,
        userId: p.userId ?? null,
        displayName: p.displayName,
        role: p.role,
        score: p.score,
        isConnected: p.isConnected,
        isReady: p.isReady,
      }))
    );
  }, [room, players]);

  if (room === undefined || players === undefined) {
    return (
      <AppShell
        topBar={
          <TopBar title={t("roomCode")} rightSlot={user ? <UserButton afterSignOutUrl="/" /> : <Link href="/sign-in">Sign in</Link>} />
        }
      >
        <Card variant="elevated" padding="lg">
          Loading…
        </Card>
      </AppShell>
    );
  }

  if (room === null) {
    return (
      <AppShell
        topBar={
          <TopBar title={t("roomCode")} rightSlot={user ? <UserButton afterSignOutUrl="/" /> : <Link href="/sign-in">Sign in</Link>} />
        }
      >
        <Card variant="elevated" padding="lg">
          Room not found.
        </Card>
      </AppShell>
    );
  }

  const isHost = me?.role === "host";
  const guestId = user ? undefined : guest.guestId;

  return (
    <AppShell
      topBar={
        <TopBar
          title={`${t("roomCode")}: ${room.code}`}
          rightSlot={user ? <UserButton afterSignOutUrl="/" /> : <Link href="/sign-in">Sign in</Link>}
        />
      }
    >
      {room.status === "lobby" ? (
        <GameLobby
          roomCode={room.code}
          players={players.map((p) => ({
            id: p._id,
            userId: p.userId ?? null,
            displayName: p.displayName,
            role: p.role,
            isReady: p.isReady,
            isConnected: p.isConnected,
            score: p.score,
          }))}
          currentUserId={user?.id ?? guest.guestId ?? null}
          canStart={canStart.ok}
          startDisabledReason={canStart.reason}
          onToggleReady={(next) => {
            if (!roomId) return;
            void setReady({ roomId, isReady: next, guestId });
          }}
          onStart={() => {
            if (!roomId) return;
            void startRoom({ roomId, guestId });
          }}
        />
      ) : room.gameId === "mumbled" ? (
        <GameStage header={<div style={{ fontSize: 20, fontWeight: 800 }}>{t("mumbled.title")}</div>}>
          <MumbledGameScreen roomId={roomId!} roomCode={room.code} isHost={!!isHost} guestId={guestId} />
        </GameStage>
      ) : (
        <GameStage header={<div style={{ fontSize: 20, fontWeight: 800 }}>{room.gameId}</div>}>
          Coming soon.
        </GameStage>
      )}
    </AppShell>
  );
}


