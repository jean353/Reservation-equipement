import React, { useState, useEffect } from 'react';
import { roomService, reservationService } from '../services/api';
import { MapPin, Users, Info, Plus, Search, X, Calendar, Clock } from 'lucide-react';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reservation Modal State
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: ''
  });
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAll();
      setRooms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
    setError('');
    // Default times: today, current hour + 1
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    setFormData({
      title: `Réunion - ${room.name}`,
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
      description: ''
    });
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    setReserving(true);
    setError('');
    try {
      await reservationService.create({
        ...formData,
        roomId: selectedRoom.id,
      });
      setIsModalOpen(false);
      alert('Réservation effectuée avec succès !');
      fetchRooms(); // Refresh status
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setReserving(false);
    }
  };

  const filteredRooms = (Array.isArray(rooms) ? rooms : []).filter(room => 
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salles</h1>
          <p className="text-gray-500">Gérez et réservez vos espaces de travail.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Nouvelle Salle
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          placeholder="Rechercher une salle par nom ou lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <h3 className="text-white font-bold text-2xl text-center">{room.name}</h3>
                </div>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  room.status === 'available' ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
                }`}>
                  {room.status === 'available' ? 'Libre' : 'Occupé'}
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{room.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{room.capacity} personnes</span>
                  </div>
                </div>
                
                {room.description && (
                  <p className="text-gray-500 text-sm line-clamp-2 italic">
                    <Info className="w-3 h-3 inline mr-1" /> {room.description}
                  </p>
                )}

                <button 
                  onClick={() => handleOpenModal(room)}
                  className="w-full py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all"
                >
                  Réserver cette salle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-bold">Réserver {selectedRoom?.name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleReserve} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                  <Info className="w-4 h-4 mr-2" /> {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Titre de la réunion</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> Début
                  </label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> Fin
                  </label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Notes (optionnel)</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={reserving}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {reserving ? 'Traitement...' : 'Confirmer la réservation'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {!loading && filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune salle trouvée correspondant à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
