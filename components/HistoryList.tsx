
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onView: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onView, onDelete }) => {
  const getModuleInfo = (item: HistoryItem) => {
    switch (item.module_type) {
        case 'admin':
            return { label: 'Administrasi', color: 'bg-blue-100 text-blue-800' };
        case 'soal':
            return { label: 'Bank Soal', color: 'bg-green-100 text-green-800' };
        case 'tryout':
            return { label: 'Try Out', color: 'bg-orange-100 text-orange-800' };
        case 'super':
            return { label: 'Terpusat', color: 'bg-purple-100 text-purple-800' };
        default:
            return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-lg card-shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Generator</h2>
      <div id="history-list" className="space-y-4">
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada riwayat.</p>
        ) : (
          history.map(item => {
            const moduleInfo = getModuleInfo(item);
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${moduleInfo.color}`}>{moduleInfo.label}</span>
                    <span className="text-sm font-medium">{item.mata_pelajaran} - Kelas {item.kelas}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => onView(item)} className="text-blue-600 text-sm">Lihat</button>
                    <button onClick={() => onDelete(item.id)} className="text-red-600 text-sm">Hapus</button>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <p><strong>Sekolah:</strong> {item.sekolah}</p>
                  <p className="mt-1"><strong>Dibuat:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default HistoryList;
