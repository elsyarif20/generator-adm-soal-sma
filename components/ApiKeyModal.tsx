import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  isDismissible: boolean;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, isDismissible, onSave, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Retrieve and set existing key when modal opens
    if (isOpen) {
      const storedKey = localStorage.getItem('userApiKey') || '';
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div id="api-key-modal" className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">Konfigurasi API Key</h2>
            {isDismissible && (
                 <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
            )}
        </div>
        <p className="text-gray-600 mb-2">
          Aplikasi ini memerlukan Google Gemini API Key untuk berfungsi. Kunci Anda disimpan secara aman di browser Anda dan tidak pernah dibagikan.
        </p>
         <p className="text-gray-600 mb-6">
          Dapatkan API key gratis Anda di{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
            Google AI Studio
          </a>.
        </p>
        
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700">Google Gemini API Key</label>
          <input
            type="password"
            id="api-key-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Masukkan API Key Anda di sini"
            required
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            Simpan Kunci
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;