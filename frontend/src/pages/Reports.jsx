import React, { useState, useEffect } from 'react';
import { reservationService } from '../services/api';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reservationService.getReports();
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-gray-500">Analysez l'utilisation des ressources et les tendances.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm font-medium">
          <Download className="w-5 h-5 mr-2" /> Exporter en PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReportStatCard 
              title="Taux d'occupation" 
              value="68%" 
              trend="+5% vs mois dernier" 
              icon={<TrendingUp className="w-5 h-5 text-green-600" />} 
            />
            <ReportStatCard 
              title="Demandes traitées" 
              value={reports?.totalReservations || 0} 
              trend="Mise à jour en temps réel" 
              icon={<BarChart3 className="w-5 h-5 text-blue-600" />} 
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Utilisation des Salles</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {reports?.mostReservedRooms?.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-gray-500">{item._count.reservations} réservations</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((item._count.reservations / (reports.totalReservations || 1)) * 100 * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar View / Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Aperçu Mensuel
          </h2>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-blue-800 text-sm font-medium mb-1">Période la plus chargée</p>
            <p className="text-blue-600 text-xs italic">Mardi et Jeudi (10h - 14h)</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Résumé</h3>
            <div className="space-y-3">
              <SummaryRow label="Total réservations" value={reports?.totalReservations || 0} />
              <SummaryRow label="Approuvées" value={reports?.approvedReservations || 0} />
              <SummaryRow label="Annulées" value="2" />
              <div className="pt-3 border-t border-gray-100">
                <SummaryRow label="Efficacité" value="94%" highlighted />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportStatCard({ title, value, trend, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <p className="text-xs text-gray-400">{trend}</p>
    </div>
  );
}

function SummaryRow({ label, value, highlighted }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${highlighted ? 'text-blue-600 text-lg' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
