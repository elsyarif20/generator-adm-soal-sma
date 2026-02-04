import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  // The automatic text-to-speech feature has been removed to prevent startup errors
  // when an API key is not yet configured, which is a common scenario on platforms like Netlify.
  // This ensures the application can load reliably and prompt for a key if necessary.

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-start p-4 py-12 text-white text-center fade-in overflow-y-auto">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">
          Selamat Datang di Platform AI Guru Inovatif
        </h1>
        <p className="text-2xl font-semibold text-gray-200 mb-2">
          Lembaga Penjaminan Mutu Pendidikan (LPMP)
        </p>
        <p className="text-xl text-gray-300 mb-8">
          YPI Pondok Modern Al-Ghozali
        </p>
        <p className="text-lg text-gray-300 mb-12 leading-relaxed">
          Revolusikan cara Anda mengajar dengan asisten cerdas yang dirancang untuk Kurikulum Merdeka. Buat perangkat ajar, bank soal adaptif, dan materi pembelajaran berkualitas tinggi dalam hitungan menit, bukan jam.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-xl mb-2">Administrasi Cerdas</h3>
            <p className="text-gray-400">Generate ATP, Prota, Promes, hingga Modul Ajar lengkap secara otomatis.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
            <h3 className="font-bold text-xl mb-2">Bank Soal Adaptif</h3>
            <p className="text-gray-400">Buat paket asesmen, kisi-kisi, dan analisis soal HOTS dengan mudah.</p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-full text-xl hover:bg-yellow-400 transition-transform transform hover:scale-105 shadow-lg"
        >
          Mulai Sekarang
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
