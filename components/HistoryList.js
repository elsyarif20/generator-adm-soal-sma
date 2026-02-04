
import React from 'react';

const HistoryList = ({ history, onView, onDelete }) => {
  const getModuleInfo = (item) => {
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

  return React.createElement("div", { className: "bg-white rounded-lg card-shadow p-6" },
    React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-6" }, "Riwayat Generator"),
    React.createElement("div", { id: "history-list", className: "space-y-4" },
      history.length === 0 ? (
        React.createElement("p", { className: "text-gray-500 text-center py-8" }, "Belum ada riwayat.")
      ) : (
        history.map(item => {
          const moduleInfo = getModuleInfo(item);
          return React.createElement("div", { key: item.id, className: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow fade-in" },
            React.createElement("div", { className: "flex items-center justify-between mb-2" },
              React.createElement("div", { className: "flex items-center space-x-2" },
                React.createElement("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${moduleInfo.color}` }, moduleInfo.label),
                React.createElement("span", { className: "text-sm font-medium" }, `${item.mata_pelajaran} - Kelas ${item.kelas}`)
              ),
              React.createElement("div", { className: "flex space-x-2" },
                React.createElement("button", { onClick: () => onView(item), className: "text-blue-600 text-sm" }, "Lihat"),
                React.createElement("button", { onClick: () => onDelete(item.id), className: "text-red-600 text-sm" }, "Hapus")
              )
            ),
            React.createElement("div", { className: "text-xs text-gray-600" },
              React.createElement("p", null, React.createElement("strong", null, "Sekolah:"), ` ${item.sekolah}`),
              React.createElement("p", { className: "mt-1" }, React.createElement("strong", null, "Dibuat:"), ` ${new Date(item.created_at).toLocaleDateString()}`)
            )
          );
        })
      )
    )
  );
};

export default HistoryList;
