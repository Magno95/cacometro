"use client";

import React, { useState } from "react";
import { addPoopAction } from "@/actions/poops-actions";
import { useCaccaSession } from "@/hooks/useCaccaSession";
import { toast } from "sonner";
import Image from "next/image";

interface AddPoopBtnProps {
  onPoopAdded?: (count: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const QUESTION_LIST = [
  "💩 Hai veramente cacato?",
  "Hai solo visitato il trono… o l’hai anche onorato?",
  "Sul serio sei andato in bagno… o era solo meditazione aromatica?",
  "Hai lasciato un ricordino o era solo una pausa di riflessione?",
  "Hai solo scrollato Instagram sul water o hai contribuito al sistema fognario?",
  "È stata una missione compiuta o un falso allarme?",
  "Hai solo scaldato la tavoletta o c’è stata un’eruzione?",
  "Parliamo di aria fritta o c'è stato del sostanzioso?",
  "Hai prodotto un capolavoro o era solo un’anteprima?",
  "È uscito qualcosa… o ti sei solo nascosto dal mondo?",
  "Dobbiamo chiamare il depuratore o basta una ventata?"
];

const AddPoopBtn: React.FC<AddPoopBtnProps> = ({ onPoopAdded, className, style }) => {
  const { pooperName, roomCode } = useCaccaSession();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleAddPoop = async () => {
    if (!pooperName || !roomCode) {
      setStatus("❌ Dati mancanti per aggiungere la poop");
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    const confirm = window.confirm(QUESTION_LIST[Math.floor(Math.random() * QUESTION_LIST.length)]);
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

        // Aggiorna cache locale
        const localKey = `poop_count_${roomCode}_${pooperName}`;
        localStorage.setItem(localKey, String(result.count));

        // Emetti evento per aggiornare la leaderboard
        window.dispatchEvent(new CustomEvent("poopAdded"));

        // Callback per notificare il parent component
        onPoopAdded?.(result.count);

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
    <button
      className={className}
      onClick={handleAddPoop}
      disabled={loading || !pooperName || !roomCode}
      style={{
        border: "none",
        background: "none",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        ...style
      }}
    >
      <Image src="/images/ccc-add-poop.png" height={100} width={100} alt="add poop" />
    </button>
  );
};

export default AddPoopBtn;
