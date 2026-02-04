
import React from 'react';

const Footer = () => {
  return React.createElement("footer", { className: "bg-gray-800 text-white py-8 mt-12" },
    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
      React.createElement("div", { className: "grid md:grid-cols-3 gap-8" },
        React.createElement("div", null,
          React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Platform Generator"),
          React.createElement("p", { className: "text-gray-300" }, "Sistem berbasis Deep Learning untuk menghasilkan perangkat administrasi guru dan bank soal sesuai Kurikulum Merdeka.")
        ),
        React.createElement("div", null,
          React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Fitur Utama"),
          React.createElement("ul", { className: "text-gray-300 space-y-2" },
            React.createElement("li", null, "• Generator ATP & Modul Ajar"),
            React.createElement("li", null, "• Bank Soal Adaptif"),
            React.createElement("li", null, "• Asesmen Komprehensif"),
            React.createElement("li", null, "• Sesuai Kurikulum Merdeka")
          )
        ),
        React.createElement("div", null,
          React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Jenjang Pendidikan"),
          React.createElement("ul", { className: "text-gray-300 space-y-2" },
            React.createElement("li", null, "• SMA (Kelas 10-12)"),
            React.createElement("li", null, "• Semua Mata Pelajaran Nasional & Agama")
          )
        )
      ),
      React.createElement("div", { className: "border-t border-gray-700 mt-8 pt-8 text-center" },
        React.createElement("p", { id: "footer-text", className: "text-gray-300" },
          "© 2025 Generator Administrasi Guru & Bank Soal Adaptif - YPI Pondok Modern Al-Ghozali. Dikembangkan dengan teknologi Deep Learning."
        ),
        React.createElement("p", { className: "text-yellow-200 text-lg font-semibold mt-4 tracking-wider" },
          "Developed @2025 by Liyas Syarifudin, M.Pd."
        )
      )
    )
  );
};

export default Footer;
