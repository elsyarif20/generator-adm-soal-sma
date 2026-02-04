
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b-4 border-yellow-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 id="app-title" className="text-3xl font-bold text-white">
              Generator Administrasi Guru &amp; Bank Soal Adaptif
            </h1>
            <p className="text-yellow-200 mt-2">
              Wujudkan Pembelajaran Inovatif dengan Perangkat Ajar Cerdas Berbasis AI
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p id="institution-name" className="text-white font-semibold">
                YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI
              </p>
              <p className="text-yellow-200 text-sm">Berbasis Deep Learning &amp; AI</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
