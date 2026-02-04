
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import Spinner from './Spinner.js';

// Audio helper functions
function encode(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
async function decodeAudioData(data, ctx, sampleRate, numChannels) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
function createBlob(data) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}

const AudioLab = ({ onBack }) => {
  const [connectionState, setConnectionState] = useState('idle');
  const [transcription, setTranscription] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  // Fix: using any for the session promise reference as LiveSession is not exported
  const sessionPromiseRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const inputAudioContextRef = useRef(null);
  const outputAudioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set());

  const cleanup = useCallback(() => {
    sessionPromiseRef.current?.then((session) => session.close());
    sessionPromiseRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    inputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    
    outputAudioContextRef.current?.close();
    outputAudioContextRef.current = null;

    setConnectionState('idle');
  }, []);

  const startConversation = async () => {
    if (connectionState !== 'idle') return;
    setConnectionState('connecting');
    setTranscription([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      let currentInputTranscription = '';
      let currentOutputTranscription = '';

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setConnectionState('connected');
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message) => {
            // Handle transcription
            if (message.serverContent?.inputTranscription) {
                currentInputTranscription += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
                currentOutputTranscription += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscription.trim();
                const fullOutput = currentOutputTranscription.trim();
                if(fullInput) setTranscription(prev => [...prev, `Anda: ${fullInput}`]);
                if(fullOutput) setTranscription(prev => [...prev, `AI: ${fullOutput}`]);
                currentInputTranscription = '';
                currentOutputTranscription = '';
            }
            
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const sourceNode = ctx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(ctx.destination);
                sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
                for (const source of sourcesRef.current.values()) source.stop();
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live session error:', e);
            setTranscription(prev => [...prev, "Error: Terjadi kesalahan koneksi."]);
            setConnectionState('error');
            cleanup();
          },
          onclose: () => {
            setConnectionState('idle');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'Anda adalah asisten AI yang ramah dan membantu untuk aplikasi pendidikan guru. Berbicaralah dalam Bahasa Indonesia.',
        },
      });
    } catch (err) {
      console.error(err);
      setTranscription(prev => [...prev, `Error: Gagal memulai sesi. ${err.message}`]);
      setConnectionState('error');
    }
  };

  useEffect(() => {
    return () => cleanup(); // Cleanup on component unmount
  }, [cleanup]);

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(prev => !prev);
    }
  };

  return (
    React.createElement("div", { className: "bg-white rounded-lg card-shadow p-6 fade-in" },
      React.createElement("button", { onClick: onBack, className: "text-blue-600 hover:text-blue-800 text-sm font-medium mb-4" }, "← Kembali ke Dashboard"),
      React.createElement("h2", { className: "text-2xl font-bold text-gray-900 mb-2" }, "Lab Audio & Percakapan"),
      React.createElement("p", { className: "text-gray-600 mb-6" }, "Mulai percakapan langsung dengan AI atau dapatkan transkripsi audio real-time."),
      
      React.createElement("div", { className: "text-center p-6 border rounded-lg bg-gray-50 min-h-[400px] flex flex-col" },
        connectionState === 'idle' && (
          React.createElement("div", { className: 'm-auto' },
            React.createElement("button", { onClick: startConversation, className: "bg-teal-600 text-white py-3 px-6 rounded-full hover:bg-teal-700 text-lg font-semibold" }, "Mulai Percakapan AI")
          )
        ),

        (connectionState === 'connecting' || connectionState === 'connected' || connectionState === 'error') && (
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: 'flex-grow overflow-y-auto p-4 text-left' },
                transcription.map((line, index) => (
                    React.createElement("p", { key: index, className: `mb-2 ${line.startsWith('AI:') ? 'text-teal-800' : 'text-gray-600'}` },
                        line
                    )
                )),
                connectionState === 'connecting' && React.createElement("div", { className: 'flex items-center text-gray-500' }, React.createElement(Spinner, null), React.createElement("span", { className: 'ml-2' }, "Menghubungkan..."))
            ),
            React.createElement("div", { className: "mt-4 pt-4 border-t flex justify-center items-center space-x-4" },
                React.createElement("button", { onClick: toggleMute, className: `p-3 rounded-full ${isMuted ? 'bg-gray-300' : 'bg-blue-200'}`, title: isMuted ? 'Unmute' : 'Mute' },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, isMuted ? React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m0 4l-4-4" }) : React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" }))
                ),
                React.createElement("button", { onClick: cleanup, className: "bg-red-600 text-white py-3 px-6 rounded-full hover:bg-red-700 font-semibold" }, "Akhiri Sesi")
            )
          )
        )
      )
    )
  );
};

export default AudioLab;