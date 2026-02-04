
import React, { useState } from 'react';

const UserRegistrationModal = ({ onSave }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    React.createElement("div", { id: "user-registration-modal", className: "fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 fade-in" },
      React.createElement("div", { className: "bg-white rounded-lg max-w-md w-full p-6 shadow-xl", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title" },
        React.createElement("form", { onSubmit: handleSubmit },
          React.createElement("h2", { id: "modal-title", className: "text-2xl font-bold text-gray-900 mb-4" }, "Selamat Datang!"),
          React.createElement("p", { className: "text-gray-600 mb-6" }, "Untuk personalisasi dan pencatatan aktivitas, silakan masukkan nama Anda."),
          
          React.createElement("div", null,
            React.createElement("label", { htmlFor: "user-name", className: "block text-sm font-medium text-gray-700" }, "Nama Lengkap"),
            React.createElement("input", {
              type: "text",
              id: "user-name",
              value: name,
              onChange: (e) => setName(e.target.value),
              className: "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
              placeholder: "Contoh: Liyas Syarifudin, M.Pd.",
              required: true
            })
          ),

          React.createElement("div", { className: "mt-6" },
            React.createElement("button", {
              type: "submit",
              className: "w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            },
              "Simpan & Mulai Gunakan"
            )
          )
        )
      )
    )
  );
};

export default UserRegistrationModal;
