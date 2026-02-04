
import React from 'react';
import { ActivityLogItem, Module } from '../types';

interface ActivityLogProps {
  logs: ActivityLogItem[];
}

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
};

const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const getModuleInfo = (module_type: Module): { icon: React.ReactElement; label: string } => {
    switch (module_type) {
      case 'admin':
        return {
          label: 'Administrasi',
          icon: (
            <div className="bg-blue-500 p-2 rounded-full">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
          ),
        };
      case 'soal':
        return {
          label: 'Bank Soal',
          icon: (
            <div className="bg-green-500 p-2 rounded-full">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
          ),
        };
      case 'tryout':
        return {
          label: 'Try Out',
          icon: (
            <div className="bg-orange-500 p-2 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
          ),
        };
      case 'super':
        return {
          label: 'Terpusat',
          icon: (
            <div className="bg-purple-500 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l.407 8.14a1 1 0 00.95.95l8.14.407a1 1 0 01.95.897 1 1 0 01-.95.897l-8.14.407a1 1 0 00-.95.95l-.407 8.14a1 1 0 01-.897.95 1 1 0 01-.897-.95l-.407-8.14a1 1 0 00-.95-.95l-8.14-.407a1 1 0 01-.95-.897 1 1 0 01.95-.897l8.14-.407a1 1 0 00.95-.95l.407-8.14a1 1 0 01.897-.95z" clipRule="evenodd" /></svg>
            </div>
          ),
        };
      default:
         return {
          label: 'Aktivitas',
          icon: (
            <div className="bg-gray-500 p-2 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          ),
        };
    }
  };

  return (
    <div className="bg-white rounded-lg card-shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Aktivitas Terkini</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada aktivitas.</p>
        ) : (
          logs.map(log => {
            const moduleInfo = getModuleInfo(log.module_type);
            return (
              <div key={log.id} className="flex items-start space-x-4 fade-in">
                {moduleInfo.icon}
                <div className="flex-grow">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{log.user}</span> meng-generate {' '}
                    <span className="font-semibold">{moduleInfo.label}</span>
                  </p>
                  <p className="text-xs text-gray-500">{log.details}</p>
                   <p className="text-xs text-gray-400 mt-1">{timeAgo(log.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
