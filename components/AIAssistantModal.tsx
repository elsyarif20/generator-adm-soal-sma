

import React, { useState, useEffect } from 'react';
import { FormData } from '../types';
import Spinner from './Spinner';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<FormData>;
  getSuggestions: (formData: Partial<FormData>) => Promise<string[] | string>;
  suggestionType: 'list' | 'markdown';
  title: string;
  description: string;
  targetElementId: string;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ 
  isOpen, 
  onClose, 
  formData, 
  getSuggestions,
  suggestionType,
  title,
  description,
  targetElementId,
}) => {
  const [listSuggestions, setListSuggestions] = useState<string[]>([]);
  const [markdownSuggestion, setMarkdownSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const element = document.getElementById(targetElementId) as HTMLTextAreaElement;
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
        const element = document.getElementById(targetElementId) as HTMLTextAreaElement;
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

  const renderListContent = () => (
    <div id="ai-suggestions" className="space-y-2">
      {listSuggestions.length > 0 ? (
        listSuggestions.map((suggestion, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedSuggestion(suggestion)}
            className={`p-3 rounded-md border-l-4 cursor-pointer transition-colors ${selectedSuggestion === suggestion ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-400 hover:bg-blue-100'}`}
          >
            <p className="text-sm text-blue-800">{suggestion}</p>
          </div>
        ))
      ) : (
          <div className="p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800">Tidak dapat menghasilkan saran saat ini. Silakan coba lagi.</p>
          </div>
      )}
    </div>
  );

  const renderMarkdownContent = () => (
    <div id="ai-suggestions-markdown">
      <textarea
        readOnly
        className="w-full h-64 p-2 border rounded-md bg-gray-50 font-mono text-sm"
        value={markdownSuggestion}
      />
    </div>
  );
  
  const renderError = () => (
     <div className="p-3 bg-red-50 rounded-md border-l-4 border-red-400">
        <p className="text-sm text-red-800 font-semibold">Terjadi Kesalahan</p>
        <p className="text-sm text-red-700 mt-1">{error}</p>
    </div>
  );

  return (
    <div id="ai-modal" className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-600 mb-3">{description}</p>
          {isLoading ? (
              <div className="flex justify-center items-center p-4 h-64">
                  <Spinner />
                  <span className="ml-2 text-gray-600">Membuat saran...</span>
              </div>
          ) : error ? (
            renderError()
          ) : (
            suggestionType === 'list' ? renderListContent() : renderMarkdownContent()
          )}
        </div>
        <div className="flex justify-end space-x-2">
          {suggestionType === 'list' ? (
            <>
              <button onClick={handleApplyListSelection} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300" disabled={!selectedSuggestion || isLoading || !!error}>Terapkan Saran</button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">Batal</button>
            </>
          ) : (
            <>
              <button onClick={handleCopyMarkdown} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300" disabled={!markdownSuggestion || isLoading || !!error}>
                {copySuccess ? '✔️ Berhasil Disalin' : '📋 Salin Teks'}
              </button>
              <button onClick={handleApplyMarkdown} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300" disabled={!markdownSuggestion || isLoading || !!error}>Terapkan & Tutup</button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">Batal</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;