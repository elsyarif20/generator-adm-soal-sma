
import React, { useState } from 'react';
import { groundedSearch } from '../services/geminiService.js';
import Spinner from './Spinner.js';

const GroundedSearch = ({ onBack }) => {
  const [tool, setTool] = useState('web');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Silakan masukkan pertanyaan.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let location;
      if (tool === 'maps') {
        location = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            (err) => {
                setError("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
                reject(err);
            }
          );
        });
      }
      const response = await groundedSearch(query, tool, location);
      setResult(response);
    } catch (e) {
      console.error(e);
      if (!error) { // Don't overwrite geolocation error
        setError("Terjadi kesalahan saat melakukan pencarian.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  };

  return (
    React.createElement("div", { className: "bg-white rounded-lg card-shadow p-6 fade-in" },
      React.createElement("button", { onClick: onBack, className: "text-blue-600 hover:text-blue-800 text-sm font-medium mb-4" }, "← Kembali ke Dashboard"),
      React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-2" }, "Pencarian Cerdas"),
      React.createElement("p", { className: "text-gray-600 mb-6" }, "Dapatkan jawaban yang akurat dan terkini, didukung oleh Google Search dan Maps."),

      React.createElement("div", { className: "mb-4" },
        React.createElement("div", { className: "flex items-center space-x-4" },
            React.createElement("input", { type: "text", value: query, onChange: e => setQuery(e.target.value), onKeyDown: handleKeyDown, placeholder: "Tanyakan apa saja...", className: "flex-grow p-2 border rounded-md" }),
            React.createElement("button", { onClick: handleSearch, disabled: isLoading, className: "bg-yellow-600 text-white py-2 px-6 rounded-md hover:bg-yellow-700 disabled:bg-yellow-400" }, "Cari")
        )
      ),
      
      React.createElement("div", { className: "flex justify-center space-x-4 mb-6" },
        React.createElement("label", { className: "flex items-center" },
            React.createElement("input", { type: "radio", name: "tool", value: "web", checked: tool === 'web', onChange: () => setTool('web'), className: "form-radio" }),
            React.createElement("span", { className: "ml-2" }, "Web Search")
        ),
        React.createElement("label", { className: "flex items-center" },
            React.createElement("input", { type: "radio", name: "tool", value: "maps", checked: tool === 'maps', onChange: () => setTool('maps'), className: "form-radio" }),
            React.createElement("span", { className: "ml-2" }, "Maps Search")
        )
      ),

      React.createElement("div", { className: "bg-gray-50 rounded-lg p-4 min-h-[300px]" },
        isLoading && React.createElement("div", { className: "flex justify-center items-center h-full" }, React.createElement(Spinner, null), React.createElement("span", { className: "ml-2" }, "Mencari...")),
        error && React.createElement("p", { className: "text-red-500 text-center" }, error),
        result && (
            React.createElement("div", { className: 'fade-in' },
                React.createElement("div", { className: "prose max-w-none mb-6", dangerouslySetInnerHTML: { __html: result.text.replace(/\n/g, '<br/>') } }),
                result.sources.length > 0 && (
                    React.createElement("div", null,
                        React.createElement("h4", { className: "font-semibold text-gray-700" }, "Sumber:"),
                        React.createElement("ul", { className: "list-disc list-inside mt-2 text-sm space-y-1" },
                            result.sources.map((source, index) => (
                                React.createElement("li", { key: index },
                                    React.createElement("a", { href: source.uri, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline" }, source.title)
                                )
                            ))
                        )
                    )
                )
            )
        )
      )
    )
  );
};

export default GroundedSearch;
