
import React, { useState, useRef } from 'react';
import { generateImage, editImage, analyzeImage } from '../services/geminiService';
import Spinner from './Spinner';

type Tab = 'generate' | 'edit' | 'analyze';

const ImageLab: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [prompt, setPrompt] = useState('');
  
  const [editPrompt, setEditPrompt] = useState('');
  const [analyzePrompt, setAnalyzePrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const [uploadedImage, setUploadedImage] = useState<{ file: File, preview: string, base64: string, mimeType: string } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setUploadedImage({
            file: file,
            preview: URL.createObjectURL(file),
            base64: base64String,
            mimeType: file.type
        });
        setGeneratedImage(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const resetState = () => {
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);
    setAnalysisResult('');
  };

  const handleGenerate = async () => {
    if (!prompt) { setError("Prompt tidak boleh kosong."); return; }
    resetState();
    try {
      const result = await generateImage(prompt);
      setGeneratedImage(result);
    } catch (e) {
      console.error(e);
      setError("Gagal menghasilkan gambar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!uploadedImage) { setError("Silakan unggah gambar terlebih dahulu."); return; }
    if (!editPrompt) { setError("Prompt untuk edit tidak boleh kosong."); return; }
    resetState();
    try {
      const result = await editImage(uploadedImage.base64, uploadedImage.mimeType, editPrompt);
      setGeneratedImage(result);
    } catch (e) {
      console.error(e);
      setError("Gagal mengedit gambar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) { setError("Silakan unggah gambar terlebih dahulu."); return; }
    if (!analyzePrompt) { setError("Pertanyaan untuk analisis tidak boleh kosong."); return; }
    resetState();
    try {
      const result = await analyzeImage(uploadedImage.base64, uploadedImage.mimeType, analyzePrompt);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setError("Gagal menganalisis gambar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Contoh: Seekor kucing astronot mengendarai skateboard di bulan" rows={3} className="w-full p-2 border rounded" />
            <button onClick={handleGenerate} disabled={isLoading} className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-purple-400 flex justify-center items-center">
                {isLoading ? <><Spinner /><span className='ml-2'>Memproses...</span></> : 'Generate Gambar'}
            </button>
          </>
        );
      case 'edit':
      case 'analyze':
        return (
          <>
            <div className="w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50" onClick={() => fileInputRef.current?.click()}>
              {uploadedImage ? <img src={uploadedImage.preview} alt="Uploaded" className="max-h-48 mx-auto" /> : <p>Klik untuk mengunggah gambar</p>}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <textarea value={activeTab === 'edit' ? editPrompt : analyzePrompt} onChange={(e) => activeTab === 'edit' ? setEditPrompt(e.target.value) : setAnalyzePrompt(e.target.value)} placeholder={activeTab === 'edit' ? "Contoh: Ganti skateboard dengan papan selancar" : "Contoh: Ada berapa bintang di gambar ini?"} rows={3} className="w-full p-2 border rounded mt-4" />
            <button onClick={activeTab === 'edit' ? handleEdit : handleAnalyze} disabled={isLoading} className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-purple-400 flex justify-center items-center">
                {isLoading ? <><Spinner /><span className='ml-2'>Memproses...</span></> : (activeTab === 'edit' ? 'Edit Gambar' : 'Analisis Gambar')}
            </button>
          </>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg card-shadow p-6 fade-in">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">&larr; Kembali ke Dashboard</button>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Studio Gambar AI</h2>
      <p className="text-gray-600 mb-6">Buat, edit, dan pahami gambar menggunakan kekuatan AI.</p>

      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('generate')} className={`px-4 py-2 ${activeTab === 'generate' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>Generate</button>
        <button onClick={() => setActiveTab('edit')} className={`px-4 py-2 ${activeTab === 'edit' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>Edit</button>
        <button onClick={() => setActiveTab('analyze')} className={`px-4 py-2 ${activeTab === 'analyze' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}`}>Analisis</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {renderContent()}
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
          {isLoading && <div className="text-center"><Spinner /><p className="mt-2">AI sedang bekerja...</p></div>}
          {error && <p className="text-red-500">{error}</p>}
          {generatedImage && <img src={generatedImage} alt="Generated" className="max-h-full max-w-full rounded" />}
          {analysisResult && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br>') }}></div>}
        </div>
      </div>
    </div>
  );
};

export default ImageLab;
