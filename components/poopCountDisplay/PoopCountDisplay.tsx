"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCaccaSession } from "@/hooks/useCaccaSession";

type Props = {
  refreshKey?: number;
};

export default function PoopCountDisplay({ refreshKey }: Props) {
  const { pooperName, caccaId } = useCaccaSession();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true); // 👈

  useEffect(() => {
    if (!pooperName || !caccaId) {
      setCount(null);
      return;
    }

    const localKey = `poop_count_${caccaId}_${pooperName}`;
    const cached = localStorage.getItem(localKey);

    // ✅ Solo al primo render uso cache
    if (isFirstRender.current && cached) {
      setCount(Number(cached));
      isFirstRender.current = false;
      return;
    }

    // 🔁 Se è refresh o manca cache, faccio fetch
    const fetchPoopCount = async () => {
      setLoading(true);

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

      setLoading(false);
    };

    fetchPoopCount();
    isFirstRender.current = false; // fallback safety
  }, [pooperName, caccaId, refreshKey]);

  if (!pooperName || !caccaId) return <p>⚠️ Pooper o stanza non impostati</p>;
  if (count === null && loading) return <p>💩 Caricamento conteggio...</p>;
  if (count === null && !loading) return <p>❌ Pooper non trovato</p>;

  return <p>Hai fatto {count} 💩</p>;
}
