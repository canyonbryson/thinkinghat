"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card, TopBar, Button, Input } from "@thinkinghat/ui";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { t } from "@thinkinghat/i18n";
import { getOrCreateGuestIdentity, setGuestName } from "@/lib/guest";

export default function JoinRoomPage() {
  const router = useRouter();
  const { user } = useUser();
  const [code, setCode] = useState("");
  const [guest, setGuest] = useState(() => getOrCreateGuestIdentity());

  function onJoin() {
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    router.push(`/rooms/${cleaned}`);
  }

  return (
    <AppShell
      topBar={
        <TopBar
          title={t("joinRoom")}
          rightSlot={user ? <UserButton afterSignOutUrl="/" /> : <Link href="/sign-in">Sign in</Link>}
        />
      }
    >
      <Card variant="elevated" padding="lg">
        <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          {!user ? (
            <label>
              <div style={{ marginBottom: 6 }}>Your name (guest)</div>
              <Input
                value={guest.guestName}
                onChange={(e) => {
                  const next = e.target.value;
                  setGuestName(next);
                  setGuest((g) => ({ ...g, guestName: next }));
                }}
                placeholder="Guest"
              />
            </label>
          ) : null}
          <label>
            <div style={{ marginBottom: 6 }}>{t("roomCode")}</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABCDE" />
          </label>
          <Button variant="primary" onClick={onJoin}>
            {t("joinRoom")}
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}


