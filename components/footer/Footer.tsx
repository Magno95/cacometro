// import PWAInstallButton from "../pwaInstallButton/PWAInstallButton";
"use client";

import React, { useState, useEffect, useRef } from "react";
import { addPoopAction } from "@/actions/poops-actions";
import { useCaccaSession } from "@/hooks/useCaccaSession";
import { supabase } from "@/lib/supabase";

import style from "./footer.module.scss";
import Image from "next/image";
import PoopCounter from "../poopCounter/PoopCounter";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";

function Footer() {
  const { pooperName, roomCode, caccaId } = useCaccaSession();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  // Effetto per caricare il conteggio delle poops
  useEffect(() => {
    if (!pooperName || !caccaId) {
      setCount(null);
      return;
    }

    const localKey = `poop_count_${caccaId}_${pooperName}`;
    const cached = localStorage.getItem(localKey);

    // Solo al primo render usa cache
    if (isFirstRender.current && cached) {
      setCount(Number(cached));
      isFirstRender.current = false;
      return;
    }

    // Fetch dal DB
    const fetchPoopCount = async () => {
      const { data: pooper, error } = await supabase
        .from("poopers")
        .select("poop_count")
        .eq("poop_room_id", caccaId)
        .eq("name", pooperName)
        .single();

      if (error || !pooper) {
        setCount(null);
      } else {
        const poopCount = pooper.poop_count ?? 0;
        setCount(poopCount);
        localStorage.setItem(localKey, String(poopCount));
      }
    };

    fetchPoopCount();
    isFirstRender.current = false;
  }, [pooperName, caccaId]);

  const handleAddPoop = async () => {
    if (!pooperName || !roomCode) {
      setStatus("❌ Dati mancanti per aggiungere la poop");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    const confirm = window.confirm("💩 Hai veramente cacato?");
    if (!confirm) {
      setStatus("❌ Poop non aggiunta, operazione annullata.");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setStatus("💩 Aggiungendo poop...");
    setLoading(true);

    try {
      const result = await addPoopAction({ pooperName, roomCode });

      if (result.success) {
        setStatus(`✅ Poop aggiunta! Totale: ${result.count}`);
        toast.success(`Poop aggiunta! Totale: ${result.count}`, {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
            width: "220px",
            textAlign: "center",
            borderRadius: "100px",
            fontSize: "12px",
            height: "40px"
          }
        });
        setCount(result.count);

        // Aggiorna cache locale
        const localKey = `poop_count_${caccaId}_${pooperName}`;
        localStorage.setItem(localKey, String(result.count));

        // Emetti evento per aggiornare la leaderboard
        window.dispatchEvent(new CustomEvent("poopAdded"));

        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("❌ Qualcosa è andato storto.");
        toast.error("Qualcosa è andato storto.", {
          duration: 3000,
          position: "bottom-center",
          style: {
            background: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            width: "220px",
            textAlign: "center",
            borderRadius: "100px",
            fontSize: "12px",
            height: "40px"
          }
        });
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error: any) {
      console.error("Errore:", error);
      setStatus(`❌ ${error.message || "Errore sconosciuto"}`);
      toast.error(error.message || "Errore sconosciuto", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
          width: "220px",
          textAlign: "center",
          borderRadius: "100px",
          fontSize: "12px",
          height: "40px"
        }
      });
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{ position: "relative" }}>
      <nav className={style.nav}>
        <Toaster />

        {/* Pulsante per aggiungere poop */}
        <button
          className={style.addPoopBtn}
          onClick={handleAddPoop}
          disabled={loading || !pooperName || !roomCode}
          style={{
            border: "none",
            background: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          <Image src="/images/ccc-add-poop.png" height={100} width={100} alt="add poop" />
        </button>
        <div className={style.poopCounter}>{count !== null ? count : ""}</div>
      </nav>
    </footer>
  );
}

export default Footer;
