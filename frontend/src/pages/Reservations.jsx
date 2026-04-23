import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Reservations() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    reservationService.getAll()
      .then(res => {
        console.log('Data loaded:', res.data);
        setData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{padding: '20px'}}>Chargement des réservations...</div>;
  if (error) return <div style={{padding: '20px', color: 'red'}}>Erreur: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Liste des Réservations ({data.length})
      </h1>
      
      {data.length === 0 ? (
        <p>Aucune réservation pour le moment.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.map(res => (
            <div key={res.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '8px',
              background: 'white'
            }}>
              <div style={{ fontWeight: 'bold' }}>{res.title || 'Sans titre'}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Utilisateur: {res.user?.name || 'Inconnu'} | 
                Statut: <span style={{ 
                  color: res.status === 'APPROVED' ? 'green' : 'orange',
                  fontWeight: 'bold'
                }}>{res.status}</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                Salle: {res.room?.name || 'N/A'} | 
                Du: {res.startTime ? new Date(res.startTime).toLocaleString() : '?'}
              </div>
              
              {auth?.user?.role === 'ADMIN' && res.status === 'PENDING' && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      reservationService.updateStatus(res.id, 'APPROVED').then(() => window.location.reload());
                    }}
                    style={{ background: '#22c55e', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Accepter
                  </button>
                  <button 
                    onClick={() => {
                      reservationService.updateStatus(res.id, 'REJECTED').then(() => window.location.reload());
                    }}
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
