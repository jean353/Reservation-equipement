import React, { useState, useEffect } from 'react';
import { equipmentService, reservationService } from '../services/api';
import { Monitor, Cpu, Search, Plus, Tag, Hash, X, Clock, Info } from 'lucide-react';

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Reservation Modal State
  const [selectedItem, setSelectedItem] = useState(null);
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
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentService.getAll();
      setEquipment(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setError('');
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    setFormData({
      title: `Emprunt - ${item.name}`,
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
        equipmentIds: [selectedItem.id],
      });
      setIsModalOpen(false);
      alert('Équipement réservé avec succès !');
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setReserving(false);
    }
  };

  const filteredEquipment = (Array.isArray(equipment) ? equipment : []).filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Équipements</h1>
          <p className="text-gray-500">Consultez et réservez le matériel disponible.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Nouvel Équipement
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          placeholder="Rechercher par nom, type ou numéro de série..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Équipement</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Numéro de série</th>
              <th className="px-6 py-4">Quantité</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-4 h-16 bg-gray-50/50"></td>
                </tr>
              ))
            ) : filteredEquipment.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg mr-3">
                      <Monitor className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center text-gray-600">
                    <Tag className="w-4 h-4 mr-2 text-gray-400" /> {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center text-gray-600">
                    <Hash className="w-4 h-4 mr-2 text-gray-400" /> {item.serialNumber}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'available' ? 'Disponible' : 'Indisponible'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    disabled={item.status !== 'available'}
                    className="text-blue-600 font-medium hover:text-blue-800 transition-colors disabled:text-gray-300"
                  >
                    Réserver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && filteredEquipment.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Aucun équipement trouvé.
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Réserver {selectedItem?.name}</h3>
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
                <label className="text-sm font-semibold text-gray-700">Motif de l'emprunt</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={reserving}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {reserving ? 'Traitement...' : 'Confirmer la réservation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
