'use client';
import React, { useState, useEffect } from 'react';
import { listPoopsAction } from 'actions/actions';

function Leaderboard() {
  const [poops, setPoops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPoops();
  }, []);

  const loadPoops = async () => {
    try {
      setLoading(true);
      const data = await listPoopsAction();
      // Ordina per conteggio decrescente
      const sortedData = data.sort((a, b) => b.count - a.count);
      setPoops(sortedData);
    } catch (err) {
      console.error('Errore nel caricare le poops:', err);
      setError('Errore nel caricare i dati');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div>❌ {error}</div>;
  }

  return (
    <div>
      <h2>🏆 Leaderboard Cacche</h2>
      {poops.length === 0 ? (
        <p>Nessuna cacca registrata ancora!</p>
      ) : (
        <div>
          {poops.map((poop, index) => (
            <div
              key={poop.pooperName}
              style={{
                padding: '10px',
                margin: '5px 0',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span style={{ marginLeft: '10px', fontSize: '16px' }}>{poop.pooperName}</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>💩 {poop.count}</div>
              </div>
              {poop.lastUpdated && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Ultimo aggiornamento: {new Date(poop.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={loadPoops}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Aggiorna Leaderboard
        </button>
        <a
          href="/add-poops"
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#212529',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            marginRight: '10px'
          }}
        >
          💩 Aggiungi Poop
        </a>
        <a
          href="/add-poopers"
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block'
          }}
        >
          👥 Gestisci Poopers
        </a>
      </div>
    </div>
  );
}

export default Leaderboard;
