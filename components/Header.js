
import React from 'react';

const Header = () => {
  return React.createElement("header", { className: "bg-gray-900 border-b-4 border-yellow-500 shadow-lg" },
    React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" },
      React.createElement("div", { className: "flex items-center justify-between" },
        React.createElement("div", null,
          React.createElement("h1", { id: "app-title", className: "text-3xl font-bold text-white" },
            "Generator Administrasi Guru & Bank Soal Adaptif"
          ),
          React.createElement("p", { className: "text-yellow-200 mt-2" },
            "Wujudkan Pembelajaran Inovatif dengan Perangkat Ajar Cerdas Berbasis AI"
          )
        ),
        React.createElement("div", { className: "flex items-center space-x-4" },
          React.createElement("div", { className: "text-right" },
            React.createElement("p", { id: "institution-name", className: "text-white font-semibold" },
              "YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI"
            ),
            React.createElement("p", { className: "text-yellow-200 text-sm" }, "Berbasis Deep Learning & AI")
          )
        )
      )
    )
  );
};

export default Header;
