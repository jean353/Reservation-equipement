import React from 'react';
import { History as HistoryIcon, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function History() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Historique</h1>
        <p className="text-gray-500">Consultez l'historique complet des actions et réservations.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Activités Récentes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <div className="mt-1 p-2 bg-blue-50 rounded-lg text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Mise à jour du statut de réservation #RES-00{i}</p>
                  <span className="text-xs text-gray-400">Il y a {i * 2} heures</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  La réservation "Réunion Projet A" a été <span className="text-green-600 font-medium">approuvée</span> par l'administrateur.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
