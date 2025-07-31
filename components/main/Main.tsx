"use client";

import { useEffect, useState } from "react";
import Leaderboard from "../leaderboard/Leaderboard";
import PoopOverlay from "../overlay/PoopOverlay";
import { useCaccaSession } from "@/hooks/useCaccaSession";

function Main() {
  const { pooperName, roomCode, setSession } = useCaccaSession();
  const [askOverlay, setAskOverlay] = useState(false);
  const [roomCodeFromUrl, setRoomCodeFromUrl] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomCode = urlParams.get("poop_room_id");

    setRoomCodeFromUrl(urlRoomCode);

    console.log("URL Room Code:", urlRoomCode);
    console.log("Current Session:", { pooperName, roomCode });

    if (urlRoomCode && urlRoomCode !== roomCode) {
      // Se cambia stanza da URL → chiedi nome
      setAskOverlay(true);
    } else if (!pooperName || !roomCode) {
      // Nessuna sessione salvata
      setAskOverlay(true);
    } else {
      setAskOverlay(false);
    }
  }, [pooperName, roomCode]);

  const handleSave = (roomId: string, roomCode: string, name: string) => {
    console.log("Saving session:", { roomId, roomCode, name });
    setSession(roomId, roomCode, name);
    setAskOverlay(false);
  };

  return (
    <main>
      {askOverlay && <PoopOverlay poopRoomCode={roomCodeFromUrl} onSave={handleSave} />}
      {!askOverlay && roomCode && pooperName && <Leaderboard poopRoomId={roomCode} pooperName={pooperName} />}
    </main>
  );
}

export default Main;
