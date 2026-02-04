
import React, { useState, useEffect } from 'react';
import Spinner from './Spinner.js';

const AIAssistantModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  getSuggestions,
  suggestionType,
  title,
  description,
  targetElementId,
}) => {
  const [listSuggestions, setListSuggestions] = useState([]);
  const [markdownSuggestion, setMarkdownSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setListSuggestions([]);
      setMarkdownSuggestion('');
      setSelectedSuggestion(null);
      setCopySuccess(false);

      getSuggestions(formData)
        .then(data => {
          if (suggestionType === 'list' && Array.isArray(data)) {
            setListSuggestions(data);
            if (data.length > 0) {
              setSelectedSuggestion(data[0]);
            }
          } else if (suggestionType === 'markdown' && typeof data === 'string') {
            setMarkdownSuggestion(data);
          }
        })
        .catch(err => {
            console.error("Failed to get suggestions:", err);
            setError("Gagal mendapatkan saran dari AI. Server mungkin sedang sibuk atau terjadi kesalahan. Silakan coba lagi nanti.");
        })
        .finally(() => setIsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData]);

  const handleApplyListSelection = () => {
    if (selectedSuggestion) {
      const element = document.getElementById(targetElementId);
      if (element) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;
        nativeInputValueSetter?.call(element, selectedSuggestion);
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
      }
    }
    onClose();
  };
  
  const handleApplyMarkdown = () => {
    if (markdownSuggestion) {
        const element = document.getElementById(targetElementId);
        if (element) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value'
            )?.set;
            nativeInputValueSetter?.call(element, markdownSuggestion);
            const event = new Event('input', { bubbles: true });
            element.dispatchEvent(event);
        }
    }
    onClose();
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownSuggestion).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (!isOpen) return null;

  const renderListContent = () => React.createElement("div", { id: "ai-suggestions", className: "space-y-2" },
    listSuggestions.length > 0 ? (
      listSuggestions.map((suggestion, index) => React.createElement("div", {
        key: index,
        onClick: () => setSelectedSuggestion(suggestion),
        className: `p-3 rounded-md border-l-4 cursor-pointer transition-colors ${selectedSuggestion === suggestion ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-400 hover:bg-blue-100'}`
      },
        React.createElement("p", { className: "text-sm text-blue-800" }, suggestion)
      ))
    ) : (
      React.createElement("div", { className: "p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-400" },
        React.createElement("p", { className: "text-sm text-yellow-800" }, "Tidak dapat menghasilkan saran saat ini. Silakan coba lagi.")
      )
    )
  );

  const renderMarkdownContent = () => React.createElement("div", { id: "ai-suggestions-markdown" },
    React.createElement("textarea", {
      readOnly: true,
      className: "w-full h-64 p-2 border rounded-md bg-gray-50 font-mono text-sm",
      value: markdownSuggestion
    })
  );
  
  const renderError = () => React.createElement("div", { className: "p-3 bg-red-50 rounded-md border-l-4 border-red-400" },
    React.createElement("p", { className: "text-sm text-red-800 font-semibold" }, "Terjadi Kesalahan"),
    React.createElement("p", { className: "text-sm text-red-700 mt-1" }, error)
  );

  return React.createElement("div", { id: "ai-modal", className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 fade-in" },
    React.createElement("div", { className: "bg-white rounded-lg max-w-2xl w-full p-6", role: "dialog", "aria-modal": "true" },
      React.createElement("div", { className: "flex items-center justify-between mb-4" },
        React.createElement("h3", { className: "text-lg font-semibold text-gray-900" }, title),
        React.createElement("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600" },
          React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }))
        )
      ),
      React.createElement("div", { className: "mb-4" },
        React.createElement("p", { className: "text-gray-600 mb-3" }, description),
        isLoading ? (
            React.createElement("div", { className: "flex justify-center items-center p-4 h-64" },
                React.createElement(Spinner, null),
                React.createElement("span", { className: "ml-2 text-gray-600" }, "Membuat saran...")
            )
        ) : error ? (
          renderError()
        ) : (
          suggestionType === 'list' ? renderListContent() : renderMarkdownContent()
        )
      ),
      React.createElement("div", { className: "flex justify-end space-x-2" },
        suggestionType === 'list' ? (
          React.createElement(React.Fragment, null,
            React.createElement("button", { onClick: handleApplyListSelection, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300", disabled: !selectedSuggestion || isLoading || !!error }, "Terapkan Saran"),
            React.createElement("button", { onClick: onClose, className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" }, "Batal")
          )
        ) : (
          React.createElement(React.Fragment, null,
            React.createElement("button", { onClick: handleCopyMarkdown, className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300", disabled: !markdownSuggestion || isLoading || !!error },
              copySuccess ? '✔️ Berhasil Disalin' : '📋 Salin Teks'
            ),
            React.createElement("button", { onClick: handleApplyMarkdown, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300", disabled: !markdownSuggestion || isLoading || !!error }, "Terapkan & Tutup"),
            React.createElement("button", { onClick: onClose, className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" }, "Batal")
          )
        )
      )
    )
  );
};

export default AIAssistantModal;
