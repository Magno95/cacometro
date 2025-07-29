"use client";
import React, { useEffect } from "react";

const Manifest = () => {
  useEffect(() => {
    const caccaId = new URLSearchParams(window.location.search).get("caccaId") ?? "default";
    const manifestLink = document.createElement("link");
    manifestLink.rel = "manifest";
    manifestLink.href = `/api/manifest?caccaId=${caccaId}`;
    document.head.appendChild(manifestLink);
  }, []);
  return <></>;
};

export default Manifest;
