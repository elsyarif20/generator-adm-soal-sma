
import React, { useState } from 'react';
import { groundedSearch } from '../services/geminiService';
import { GroundingSource } from '../types';
import Spinner from './Spinner';

type SearchTool = 'web' | 'maps';

const GroundedSearch: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tool, setTool] = useState<SearchTool>('web');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Silakan masukkan pertanyaan.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let location: { latitude: number; longitude: number } | undefined;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg card-shadow p-6 fade-in">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">&larr; Kembali ke Dashboard</button>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pencarian Cerdas</h2>
      <p className="text-gray-600 mb-6">Dapatkan jawaban yang akurat dan terkini, didukung oleh Google Search dan Maps.</p>

      <div className="mb-4">
        <div className="flex items-center space-x-4">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Tanyakan apa saja..." className="flex-grow p-2 border rounded-md" />
            <button onClick={handleSearch} disabled={isLoading} className="bg-yellow-600 text-white py-2 px-6 rounded-md hover:bg-yellow-700 disabled:bg-yellow-400">Cari</button>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4 mb-6">
        <label className="flex items-center">
            <input type="radio" name="tool" value="web" checked={tool === 'web'} onChange={() => setTool('web')} className="form-radio" />
            <span className="ml-2">Web Search</span>
        </label>
        <label className="flex items-center">
            <input type="radio" name="tool" value="maps" checked={tool === 'maps'} onChange={() => setTool('maps')} className="form-radio" />
            <span className="ml-2">Maps Search</span>
        </label>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /><span className="ml-2">Mencari...</span></div>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {result && (
            <div className='fade-in'>
                <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br/>') }}></div>
                {result.sources.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-700">Sumber:</h4>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                            {result.sources.map((source, index) => (
                                <li key={index}>
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.title}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default GroundedSearch;
