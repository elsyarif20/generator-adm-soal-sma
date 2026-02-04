
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo, checkVideoOperation, analyzeVideoFrames } from '../services/geminiService';
import Spinner from './Spinner';

type Tab = 'generate' | 'analyze';

/**
 * A dedicated video player component for a more integrated experience.
 * It handles aspect ratios and provides standard controls for playback.
 */
const VideoPlayer: React.FC<{ src: string; aspectRatio: '16:9' | '9:16' }> = ({ src, aspectRatio }) => {
  const aspectRatioClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]';

  return (
    <div className={`w-full bg-black rounded-lg overflow-hidden ${aspectRatioClass}`}>
      <video
        key={src} // Re-mounts the component when the video source changes
        src={src}
        controls
        autoPlay
        playsInline
        loop
        className="w-full h-full object-contain"
      >
        Browser Anda tidak mendukung tag video.
      </video>
    </div>
  );
};


const VideoLab: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const [uploadedImage, setUploadedImage] = useState<{ base64: string, mimeType: string, preview: string } | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<{ file: File, preview: string } | null>(null);
  const [analyzePrompt, setAnalyzePrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setUploadedImage({ base64: base64String, mimeType: file.type, preview: URL.createObjectURL(file) });
        };
        reader.readAsDataURL(file);
    } else {
        setUploadedVideo({ file, preview: URL.createObjectURL(file) });
    }
  };
  
  const resetState = (message: string) => {
    setError(null);
    setGeneratedVideoUrl(null);
    setAnalysisResult('');
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const handleGenerateVideo = async () => {
    if (!prompt && !uploadedImage) { setError("Prompt atau gambar awal harus diisi."); return; }
    resetState("Menginisialisasi pembuatan video...");
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key tidak dikonfigurasi.");
        }
        
        let operation = await generateVideo(prompt, uploadedImage ? { imageBytes: uploadedImage.base64, mimeType: uploadedImage.mimeType } : null, aspectRatio);
        
        setLoadingMessage("Video sedang diproses oleh AI. Ini mungkin memakan waktu beberapa menit. Mohon tunggu...");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await checkVideoOperation(operation);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            const response = await fetch(`${downloadLink}&key=${apiKey}`);
            if (!response.ok) {
                throw new Error(`Gagal mengambil video (status: ${response.status}). Periksa konfigurasi API Key.`);
            }
            const blob = await response.blob();
            const videoUrl = URL.createObjectURL(blob);
            setGeneratedVideoUrl(videoUrl);
        } else {
            throw new Error("Operasi selesai tetapi tidak ada link video yang ditemukan.");
        }
    } catch (e: any) {
        console.error(e);
        if (e.toString().toLowerCase().includes('api key')) {
            setError(e.message);
        } else {
            setError("Gagal membuat video. Silakan coba lagi.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!uploadedVideo) { setError("Silakan unggah video."); return; }
    if (!analyzePrompt) { setError("Prompt analisis tidak boleh kosong."); return; }
    resetState("Menganalisis video...");

    try {
        const frames = await extractFramesFromVideo(uploadedVideo.file);
        setLoadingMessage(`Mengekstrak ${frames.length} frame. Mengirim ke AI untuk dianalisis...`);
        const result = await analyzeVideoFrames(frames, analyzePrompt);
        setAnalysisResult(result);
    } catch(e) {
        console.error(e);
        setError("Gagal menganalisis video.");
    } finally {
        setIsLoading(false);
    }
  };

  const extractFramesFromVideo = (file: File, maxFrames = 15): Promise<{data: string, mimeType: string}[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames: {data: string, mimeType: string}[] = [];

        video.src = URL.createObjectURL(file);
        video.muted = true;

        video.onloadedmetadata = () => {
            const duration = video.duration;
            const interval = duration / maxFrames;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            let currentTime = 0;

            video.play();

            const captureFrame = () => {
                if (currentTime > duration || frames.length >= maxFrames) {
                    video.pause();
                    resolve(frames);
                    return;
                }
                video.currentTime = currentTime;
                setTimeout(() => {
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
                    frames.push({ data: base64, mimeType: 'image/jpeg' });
                    currentTime += interval;
                    captureFrame();
                }, 300); // Give time for seek and draw
            };
            captureFrame();
        };
        video.onerror = reject;
    });
  };

  return (
    <div className="bg-white rounded-lg card-shadow p-6 fade-in">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">&larr; Kembali ke Dashboard</button>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Studio Video AI</h2>
      <p className="text-gray-600 mb-6">Buat video dari imajinasi Anda atau analisis konten video yang ada.</p>
      
      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('generate')} className={`px-4 py-2 ${activeTab === 'generate' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}>Generate Video</button>
        <button onClick={() => setActiveTab('analyze')} className={`px-4 py-2 ${activeTab === 'analyze' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}>Analisis Video</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Contoh: Sebuah hologram neon kucing mengemudi dengan kecepatan tinggi" rows={3} className="w-full p-2 border rounded"/>
              <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50" onClick={() => imageInputRef.current?.click()}>
                {uploadedImage ? <img src={uploadedImage.preview} alt="Start frame" className="max-h-24 mx-auto" /> : <p>Unggah gambar awal (opsional)</p>}
                <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" className="hidden" />
              </div>
              <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full p-2 border rounded">
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
              </select>
              <button onClick={handleGenerateVideo} disabled={isLoading} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-red-400 flex justify-center items-center">
                {isLoading ? <><Spinner /><span className='ml-2'>Memproses...</span></> : 'Generate Video'}
              </button>
            </div>
          )}
          {activeTab === 'analyze' && (
            <div className="space-y-4">
                <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50" onClick={() => videoInputRef.current?.click()}>
                    {uploadedVideo ? <video src={uploadedVideo.preview} controls className="max-h-32 mx-auto" /> : <p>Klik untuk mengunggah video</p>}
                    <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/*" className="hidden" />
                </div>
                <textarea value={analyzePrompt} onChange={e => setAnalyzePrompt(e.target.value)} placeholder="Contoh: Rangkum poin-poin utama dari video ini." rows={3} className="w-full p-2 border rounded" />
                <button onClick={handleAnalyzeVideo} disabled={isLoading} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-red-400 flex justify-center items-center">
                    {isLoading ? <><Spinner /><span className='ml-2'>Memproses...</span></> : 'Analisis Video'}
                </button>
            </div>
          )}
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
          {isLoading && <div className="text-center"><Spinner /><p className="mt-2 text-sm text-gray-600">{loadingMessage}</p></div>}
          {error && <p className="text-red-500">{error}</p>}
          {generatedVideoUrl && <VideoPlayer src={generatedVideoUrl} aspectRatio={aspectRatio} />}
          {analysisResult && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br>') }}></div>}
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
