
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform Generator</h3>
            <p className="text-gray-300">
              Sistem berbasis Deep Learning untuk menghasilkan perangkat administrasi guru dan bank soal sesuai Kurikulum Merdeka.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Fitur Utama</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Generator ATP &amp; Modul Ajar</li>
              <li>• Bank Soal Adaptif</li>
              <li>• Asesmen Komprehensif</li>
              <li>• Sesuai Kurikulum Merdeka</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Jenjang Pendidikan</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• SMA (Kelas 10-12)</li>
              <li>• Semua Mata Pelajaran Nasional & Agama</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p id="footer-text" className="text-gray-300">
            © 2025 Generator Administrasi Guru & Bank Soal Adaptif - YPI Pondok Modern Al-Ghozali. Dikembangkan dengan teknologi Deep Learning.
          </p>
          {/* Developer credit - hardcoded as requested to prevent changes. */}
          <p className="text-yellow-200 text-lg font-semibold mt-4 tracking-wider">
            Developed @2025 by Liyas Syarifudin, M.Pd.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
