// app/error.tsx
"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <h2>Errore inaspettato 💩</h2>
        <pre>{error.message}</pre>
        <button onClick={() => reset()}>Riprova</button>
      </body>
    </html>
  );
}
