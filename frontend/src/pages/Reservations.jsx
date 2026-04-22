import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, User, FileText, Check, X, AlertCircle } from 'lucide-react';

export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, MY, PENDING

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      let response;
      if (filter === 'MY') {
        response = await reservationService.getMy();
      } else {
        response = await reservationService.getAll();
        if (filter === 'PENDING' && Array.isArray(response.data)) {
          response.data = response.data.filter(r => r.status === 'PENDING');
        }
      }
      setReservations(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await reservationService.updateStatus(id, status);
      fetchReservations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Réservations</h1>
          <p className="text-gray-500">Suivez et gérez toutes les demandes de réservation.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <FilterButton label="Toutes" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
          <FilterButton label="Mes demandes" active={filter === 'MY'} onClick={() => setFilter('MY')} />
          {user?.role === 'ADMIN' && (
            <FilterButton label="En attente" active={filter === 'PENDING'} onClick={() => setFilter('PENDING')} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)
        ) : reservations.length > 0 ? (
          reservations.map((res) => (
            <div key={res.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 md:items-center hover:shadow-md transition-all">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" /> {res.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    res.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {res.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6">
                  <InfoItem icon={<User className="w-4 h-4" />} text={res.user?.name || 'Inconnu'} label="Demandeur" />
                  <InfoItem icon={<Calendar className="w-4 h-4" />} text={new Date(res.startTime).toLocaleDateString()} label="Date" />
                  <InfoItem icon={<Clock className="w-4 h-4" />} text={`${new Date(res.startTime).toLocaleTimeString([], {hour: '2h', minute:'2h'})} - ${new Date(res.endTime).toLocaleTimeString([], {hour: '2h', minute:'2h'})}`} label="Heure" />
                  <InfoItem icon={<MapPin className="w-4 h-4" />} text={res.room?.name || 'Aucune salle'} label="Lieu" />
                </div>
              </div>

              {user?.role === 'ADMIN' && res.status === 'PENDING' && (
                <div className="flex gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                  <button 
                    onClick={() => handleStatusUpdate(res.id, 'APPROVED')}
                    className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm font-medium"
                  >
                    <Check className="w-4 h-4 mr-2" /> Approuver
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(res.id, 'REJECTED')}
                    className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all font-medium"
                  >
                    <X className="w-4 h-4 mr-2" /> Rejeter
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune réservation trouvée.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
        active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function InfoItem({ icon, text, label }) {
  return (
    <div className="flex items-center text-sm">
      <div className="p-1 bg-gray-50 rounded text-gray-400 mr-2">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 uppercase font-bold leading-none mb-0.5">{label}</span>
        <span className="text-gray-700 font-medium">{text}</span>
      </div>
    </div>
  );
}
