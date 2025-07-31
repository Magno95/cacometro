// app/api/manifest/route.js
export function GET(request) {
  const url = new URL(request.url);
  const poopRoomId = url.searchParams.get("poop_room_id") || "default";

  const manifest = {
    name: "Caccometro",
    short_name: "Caccometro",
    start_url: `/?poop_room_id=${poopRoomId}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-store"
    }
  });
}
