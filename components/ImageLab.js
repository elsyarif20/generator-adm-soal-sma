
import React, { useState, useRef } from 'react';
import { generateImage, editImage, analyzeImage } from '../services/geminiService.js';
import Spinner from './Spinner.js';

const ImageLab = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  
  const [editPrompt, setEditPrompt] = useState('');
  const [analyzePrompt, setAnalyzePrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result).split(',')[1];
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
          React.createElement(React.Fragment, null,
            React.createElement("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: "Contoh: Seekor kucing astronot mengendarai skateboard di bulan", rows: 3, className: "w-full p-2 border rounded" }),
            React.createElement("button", { onClick: handleGenerate, disabled: isLoading, className: "mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-purple-400 flex justify-center items-center" },
                isLoading ? React.createElement(React.Fragment, null, React.createElement(Spinner, null), React.createElement("span", { className: 'ml-2' }, "Memproses...")) : 'Generate Gambar'
            )
          )
        );
      case 'edit':
      case 'analyze':
        return (
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: "w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50", onClick: () => fileInputRef.current?.click() },
              uploadedImage ? React.createElement("img", { src: uploadedImage.preview, alt: "Uploaded", className: "max-h-48 mx-auto" }) : React.createElement("p", null, "Klik untuk mengunggah gambar"),
              React.createElement("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/*", className: "hidden" })
            ),
            React.createElement("textarea", { value: activeTab === 'edit' ? editPrompt : analyzePrompt, onChange: (e) => activeTab === 'edit' ? setEditPrompt(e.target.value) : setAnalyzePrompt(e.target.value), placeholder: activeTab === 'edit' ? "Contoh: Ganti skateboard dengan papan selancar" : "Contoh: Ada berapa bintang di gambar ini?", rows: 3, className: "w-full p-2 border rounded mt-4" }),
            React.createElement("button", { onClick: activeTab === 'edit' ? handleEdit : handleAnalyze, disabled: isLoading, className: "mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-purple-400 flex justify-center items-center" },
                isLoading ? React.createElement(React.Fragment, null, React.createElement(Spinner, null), React.createElement("span", { className: 'ml-2' }, "Memproses...")) : (activeTab === 'edit' ? 'Edit Gambar' : 'Analisis Gambar')
            )
          )
        );
      default:
        return null;
    }
  };

  return (
    React.createElement("div", { className: "bg-white rounded-lg card-shadow p-6 fade-in" },
      React.createElement("button", { onClick: onBack, className: "text-blue-600 hover:text-blue-800 text-sm font-medium mb-4" }, "← Kembali ke Dashboard"),
      React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-2" }, "Studio Gambar AI"),
      React.createElement("p", { className: "text-gray-600 mb-6" }, "Buat, edit, dan pahami gambar menggunakan kekuatan AI."),

      React.createElement("div", { className: "flex border-b mb-6" },
        React.createElement("button", { onClick: () => setActiveTab('generate'), className: `px-4 py-2 ${activeTab === 'generate' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}` }, "Generate"),
        React.createElement("button", { onClick: () => setActiveTab('edit'), className: `px-4 py-2 ${activeTab === 'edit' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}` }, "Edit"),
        React.createElement("button", { onClick: () => setActiveTab('analyze'), className: `px-4 py-2 ${activeTab === 'analyze' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500'}` }, "Analisis")
      ),

      React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
        React.createElement("div", { className: "space-y-4" },
          renderContent()
        ),
        React.createElement("div", { className: "bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]" },
          isLoading && React.createElement("div", { className: "text-center" }, React.createElement(Spinner, null), React.createElement("p", { className: "mt-2" }, "AI sedang bekerja...")),
          error && React.createElement("p", { className: "text-red-500" }, error),
          generatedImage && React.createElement("img", { src: generatedImage, alt: "Generated", className: "max-h-full max-w-full rounded" }),
          analysisResult && React.createElement("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: analysisResult.replace(/\n/g, '<br>') } })
        )
      )
    )
  );
};

export default ImageLab;
