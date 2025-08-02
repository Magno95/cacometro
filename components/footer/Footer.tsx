// import PWAInstallButton from "../pwaInstallButton/PWAInstallButton";
"use client";

import React, { useState, useEffect, useRef } from "react";
import { getPooperCountAction } from "@/actions/poops-actions";
import { useCaccaSession } from "@/hooks/useCaccaSession";

import style from "./footer.module.scss";
import PoopCounter from "../poopCounter/PoopCounter";
import AddPoopBtn from "../addPoopBtn/AddPoopBtn";
import { Toaster } from "../ui/sonner";

function Footer() {
  const { pooperName, roomCode } = useCaccaSession();
  const [count, setCount] = useState<number | null>(null);
  const isFirstRender = useRef(true);

  // Effetto per caricare il conteggio delle poops
  useEffect(() => {
    if (!pooperName || !roomCode) {
      setCount(null);
      return;
    }

    const localKey = `poop_count_${roomCode}_${pooperName}`;
    const cached = localStorage.getItem(localKey);

    // Solo al primo render usa cache
    if (isFirstRender.current && cached) {
      setCount(Number(cached));
      isFirstRender.current = false;
      return;
    }

    // Fetch usando action
    const fetchPoopCount = async () => {
      try {
        const poopCount = await getPooperCountAction(roomCode, pooperName);
        if (poopCount !== null) {
          setCount(poopCount);
          localStorage.setItem(localKey, String(poopCount));
        } else {
          setCount(null);
        }
      } catch (error) {
        console.error("Errore nel caricare il conteggio:", error);
        setCount(null);
      }
    };

    fetchPoopCount();
    isFirstRender.current = false;
  }, [pooperName, roomCode]);

  const handlePoopAdded = (newCount: number) => {
    setCount(newCount);
  };

  return (
    <footer style={{ position: "relative" }}>
      <nav className={style.nav}>
        <Toaster />

        {/* Pulsante per aggiungere poop */}
        <AddPoopBtn className={style.addPoopBtn} onPoopAdded={handlePoopAdded} />
        <div className={style.poopCounter}>{count !== null ? count : ""}</div>
      </nav>
    </footer>
  );
}

export default Footer;
