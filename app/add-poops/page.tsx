"use client";

import { useState, useEffect } from "react";
import PoopCountDisplay from "@/components/poopCountDisplay/PoopCountDisplay";
import AddPoopForm from "../../components/addPoopForm/AddPoopForm";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [pooperName, setPooperName] = useState<string | null>(null);
  const [caccaId, setCaccaId] = useState<string | null>(null);

  useEffect(() => {
    const storedRoom = localStorage.getItem("poop_room_id");
    const pooperMap = JSON.parse(localStorage.getItem("pooper_by_room") || "{}");
    const pooper = storedRoom ? pooperMap[storedRoom] : null;

    if (storedRoom && pooper) {
      setCaccaId(storedRoom);
      setPooperName(pooper);
    }
  }, []);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <>
      <Header />
      {pooperName && caccaId && (
        <>
          <PoopCountDisplay refreshKey={refreshKey} />
          <AddPoopForm onPoopAdded={triggerRefresh} />
        </>
      )}
      <Footer />
    </>
  );
}
