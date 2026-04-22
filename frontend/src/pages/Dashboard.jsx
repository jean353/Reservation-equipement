import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservationService, roomService, equipmentService } from '../services/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Monitor,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReservations: 0,
    activeReservations: 0,
    availableRooms: 0,
    availableEquipment: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [res, rooms, equip] = await Promise.all([
          reservationService.getAll(),
          roomService.getAll(),
          equipmentService.getAll()
        ]);
        
        setStats({
          totalReservations: res.data?.length || 0,
          activeReservations: res.data?.filter(r => r.status === 'APPROVED').length || 0,
          availableRooms: rooms.data?.filter(r => r.status === 'available').length || 0,
          availableEquipment: equip.data?.filter(e => e.status === 'available').length || 0
        });
        setRecentReservations(res.data || []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user?.name}</h1>
        <p className="text-gray-500">Voici un aperçu de l'activité du système aujourd'hui.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Réservations" 
          value={stats.totalReservations} 
          icon={<Calendar className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Approuvées" 
          value={stats.activeReservations} 
          icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
          color="bg-green-50" 
        />
        <StatCard 
          title="Salles Libres" 
          value={stats.availableRooms} 
          icon={<Users className="w-6 h-6 text-purple-600" />} 
          color="bg-purple-50" 
        />
        <StatCard 
          title="Équipements Libres" 
          value={stats.availableEquipment} 
          icon={<Monitor className="w-6 h-6 text-orange-600" />} 
          color="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Réservations Récentes</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center">
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentReservations.length > 0 ? (
              recentReservations.map((res) => (
                <div key={res.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${res.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{res.title}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-3">
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {res.room?.name || 'Sans salle'}</span>
                        <span>{new Date(res.startTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    res.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                    res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {res.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 italic">
                Aucune réservation récente.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions or Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            <QuickActionButton label="Réserver une salle" icon={<Users className="w-4 h-4" />} color="text-blue-600" bgColor="bg-blue-50" />
            <QuickActionButton label="Emprunter du matériel" icon={<Monitor className="w-4 h-4" />} color="text-purple-600" bgColor="bg-purple-50" />
            <QuickActionButton label="Signaler un incident" icon={<AlertCircle className="w-4 h-4" />} color="text-red-600" bgColor="bg-red-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ label, icon, color, bgColor }) {
  return (
    <button className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left">
      <div className={`p-2 rounded-md ${bgColor} ${color} mr-3`}>
        {icon}
      </div>
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
}
