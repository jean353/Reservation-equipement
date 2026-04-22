import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Check, 
  X, 
  AlertCircle,
  Search
} from 'lucide-react';

export default function Reservations() {
  const auth = useAuth();
  const user = auth?.user;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await reservationService.getAll();
      setReservations(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await reservationService.updateStatus(id, status);
      alert(`Réservation ${status === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès.`);
      fetchReservations();
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  const filteredReservations = (reservations || []).filter(res => {
    if (!res) return false;
    if (filter === 'MY' && res.userId !== user?.id) return false;
    if (filter === 'PENDING' && res.status !== 'PENDING') return false;
    if (filter === 'APPROVED' && res.status !== 'APPROVED') return false;
    if (filter === 'REJECTED' && res.status !== 'REJECTED') return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      (res.title || '').toLowerCase().includes(searchLower) ||
      (res.user?.name || '').toLowerCase().includes(searchLower) ||
      (res.room?.name || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Réservations</h1>
          <p className="text-slate-500">Suivez et gérez les demandes de réservation.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'ALL' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setFilter('MY')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'MY' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Mes Demandes
          </button>
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'PENDING' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              À Valider
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : filteredReservations.length > 0 ? (
          filteredReservations.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${res.status === 'APPROVED' ? 'bg-green-500' : res.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${res.status === 'APPROVED' ? 'bg-green-100 text-green-700' : res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {res.status}
                    </span>
                    <span className="text-slate-400 text-xs">#{res.id?.toString().substring(0, 8)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{res.title}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User size={16} className="text-slate-400" />
                      <span className="font-medium">{res.user?.name || 'Inconnu'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="font-medium">{res.room?.name || 'Aucune salle'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="font-medium">{new Date(res.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      <span className="font-medium">{new Date(res.startTime).toLocaleTimeString([], {hour:'2h', minute:'2h'})} - {new Date(res.endTime).toLocaleTimeString([], {hour:'2h', minute:'2h'})}</span>
                    </div>
                  </div>
                </div>

                {user?.role === 'ADMIN' && res.status === 'PENDING' && (
                  <div className="flex gap-2 items-center lg:border-l lg:pl-4">
                    <button 
                      onClick={() => handleStatusUpdate(res.id, 'APPROVED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                    >
                      <Check size={18} /> Accepter
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(res.id, 'REJECTED')}
                      className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-50 flex items-center gap-2"
                    >
                      <X size={18} /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">Aucune réservation trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}
