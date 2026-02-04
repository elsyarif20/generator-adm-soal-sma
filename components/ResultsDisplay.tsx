
import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedSection, Module, FormData } from '../types';
import { ARABIC_SUBJECTS } from '../constants';
import { textToSpeech } from '../services/geminiService';

const downloadDoc = (fileName: string, content: string, formData: FormData | null, module: Module) => {
    const isArabicContext = formData?.bahasa === 'Bahasa Arab';

    const fontAndDirectionStyles = isArabicContext 
        ? `body { font-family: 'Times New Roman', serif; direction: rtl; font-size: 12pt; }` 
        : `body { font-family: 'Times New Roman', serif; direction: ltr; font-size: 12pt; }`;

    const styles = `
        @page WordSection1 {
            size: 8.5in 14.0in; /* US Legal, Portrait */
            margin: 2.0cm;
            mso-header-margin:.5in;
            mso-footer-margin:.5in;
            mso-paper-source:0;
        }
        div.WordSection1 {
            page: WordSection1;
        }
        ${fontAndDirectionStyles}
        
        /* Table Styles */
        table {
            border-collapse: collapse;
            width: 100%;
            table-layout: auto;
            margin-bottom: 1em;
        }
        th, td {
            border: 1px solid black;
            padding: 6px; 
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f2f2f2;
            text-align: center;
            font-weight: bold;
        }

        /* Heading Styles */
        h1, h2, h3, h4 {
            font-family: 'Arial', sans-serif;
            page-break-after: avoid;
            margin-top: 1.2em;
            margin-bottom: 0.5em;
        }
        
        /* IMPROVED LIST STYLES FOR QUESTIONS */
        ol {
            margin-top: 0;
            margin-bottom: 0;
            padding-left: 2.5em; /* Standard indentation for questions */
        }
        
        /* Style for Question Items */
        li {
            margin-bottom: 0.8em; /* Space between questions */
            line-height: 1.5;
        }

        /* Nested List for Options (A, B, C...) */
        ol[type="A"], ol[style*="upper-alpha"] {
            list-style-type: upper-alpha;
            margin-top: 0.3em;
            margin-bottom: 0.5em;
            padding-left: 1.5em; /* Indent options slightly relative to the question text */
        }
        
        /* Style for Option Items */
        ol[type="A"] li, ol[style*="upper-alpha"] li {
            margin-bottom: 0.2em; /* Tighter space between options */
            padding-left: 0.5em;
        }

        /* Handle Paragraphs inside lists to avoid double spacing */
        li p {
            margin: 0;
            display: inline;
        }

        ${isArabicContext ? `th, td, li { text-align: right; }` : ''}
    `;

    // Construct Header (Kop Surat) based on module type
    let headerHTML = "";
    
    if (formData && (module === 'soal' || module === 'tryout')) {
         headerHTML = `
            <table style="width: 100%; border: 2px solid black; border-collapse: collapse; font-family: 'Times New Roman', serif; margin-bottom: 20px;">
                <tr>
                    <td style="width: 15%; border-right: 2px solid black; border-bottom: 2px solid black; padding: 10px; text-align: center; vertical-align: middle;">
                         ${formData.logo_sekolah 
                            ? `<img src="${formData.logo_sekolah}" width="90" height="90" alt="Logo">` 
                            : `<div style="font-size:10pt; font-weight:bold; padding: 10px;">LOGO<br>YPI<br>AL-GHOZALI</div>`
                         }
                    </td>
                    <td style="width: 85%; border-bottom: 2px solid black; padding: 5px; text-align: center; vertical-align: middle;">
                        <div style="font-size: 14pt; font-weight: bold; margin-bottom: 4px;">${formData.yayasan || 'YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI'}</div>
                        <div style="font-size: 16pt; font-weight: bold; margin-bottom: 4px;">${formData.sekolah || 'SEKOLAH MENENGAH ATAS (SMA) ISLAM AL-GHOZALI'}</div>
                        <div style="font-size: 11pt;">${formData.alamat_sekolah || 'Jl. Permata No. 19 Curug Gunungsindur Kab. Bogor 16340'}</div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="border-bottom: 2px solid black; padding: 8px; text-align: center; font-weight: bold;">
                        <div style="font-size: 14pt; text-transform: uppercase;">${formData.judul_asesmen || 'TRY OUT 1 SEMESTER GENAP'}</div>
                        <div style="font-size: 14pt;">TAHUN PELAJARAN ${formData.tahun_ajaran || '2025-2026'}</div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="padding: 10px; border: 1px solid black;">
                        <table style="width: 100%; border: none; font-size: 12pt; font-family: 'Times New Roman', serif; margin: 0;">
                            <tr>
                                <td style="width: 15%; border: none; padding: 2px;">Mata Pelajaran</td>
                                <td style="width: 2%; border: none; padding: 2px;">:</td>
                                <td style="width: 43%; border: none; padding: 2px;">${formData.mata_pelajaran || '...................'}</td>
                                <td style="width: 15%; border: none; padding: 2px;">Hari/Tanggal</td>
                                <td style="width: 2%; border: none; padding: 2px;">:</td>
                                <td style="width: 23%; border: none; padding: 2px;">${formData.tanggal_ujian || '................, ...... Februari 2026'}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 2px;">Kelas</td>
                                <td style="border: none; padding: 2px;">:</td>
                                <td style="border: none; padding: 2px;">${formData.kelas || '...................'}</td>
                                <td style="border: none; padding: 2px;">Jam Ke-</td>
                                <td style="border: none; padding: 2px;">:</td>
                                <td style="border: none; padding: 2px;">${formData.jam_ke || '.......'}</td>
                            </tr>
                            <tr>
                                <td style="border: none; padding: 2px;">Waktu</td>
                                <td style="border: none; padding: 2px;">:</td>
                                <td style="border: none; padding: 2px;">${formData.waktu_ujian || '120 Menit'}</td>
                                <td colspan="3" style="border: none;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <br/>
         `;
    } else if (formData && module === 'admin') {
         // Simple header for Admin docs if needed, or leave blank to rely on content titles
         headerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="margin:0;">${formData.mata_pelajaran.toUpperCase()}</h2>
                <h3 style="margin:5px 0;">KELAS ${formData.kelas} - ${formData.tahun_ajaran}</h3>
                <p>${formData.sekolah}</p>
                <hr style="border-top: 2px solid black;"/>
            </div>
         `;
    }

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${fileName}</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="WordSection1 ${isArabicContext ? 'arabic-font-preview' : ''}">
            ${headerHTML}
    `;
    const footer = "</div></body></html>";
    const sourceHTML = header + content + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${fileName}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
};

interface ResultsDisplayProps {
  module: Module;
  sections: GeneratedSection[];
  formData: FormData;
  onUpdateSectionContent: (id: string, newContent: string) => void;
  onDeleteSection: (id: string) => void;
  onNewGeneration: () => void;
  onBack: () => void;
  onSaveSession: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ module, sections, formData, onUpdateSectionContent, onDeleteSection, onNewGeneration, onBack, onSaveSession }) => {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [audioState, setAudioState] = useState<{ isPlaying: boolean; sectionId: string | null; audioContext: AudioContext | null; source: AudioBufferSourceNode | null }>({ isPlaying: false, sectionId: null, audioContext: null, source: null });
  const [isAudioFeatureDisabled, setIsAudioFeatureDisabled] = useState(false);

  useEffect(() => {
    setSelectedSections(new Set(sections.map(s => s.id)));
  }, [sections]);

  const filterCategories = useMemo(() => {
    const categories = ['Semua'];
    sections.forEach(s => {
      // Basic heuristic to group titles
      let cat = s.title.split(' ')[0].replace(/[^a-zA-Z]/g, '');
      if (s.title.toLowerCase().includes('atp')) cat = 'ATP';
      if (s.title.toLowerCase().includes('naskah')) cat = 'Naskah';
      if (s.title.toLowerCase().includes('soal')) cat = 'Soal';
      if (s.title.toLowerCase().includes('kunci')) cat = 'Kunci';
      if (s.title.toLowerCase().includes('modul')) cat = 'Modul';
      if (s.title.toLowerCase().includes('prota')) cat = 'Prota';
      if (s.title.toLowerCase().includes('promes')) cat = 'Promes';
      if (s.title.toLowerCase().includes('kktp')) cat = 'KKTP';
      if (!categories.includes(cat)) categories.push(cat);
    });
    return categories;
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (activeFilter === 'Semua') return sections;
    return sections.filter(s => {
        const titleLower = s.title.toLowerCase();
        const filterLower = activeFilter.toLowerCase();
        return titleLower.includes(filterLower) || s.title.startsWith(activeFilter);
    });
  }, [sections, activeFilter]);

  const handleSelectionChange = (sectionId: string) => {
    setSelectedSections(prev => {
        const newSelection = new Set(prev);
        newSelection.has(sectionId) ? newSelection.delete(sectionId) : newSelection.add(sectionId);
        return newSelection;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.checked ? setSelectedSections(new Set(filteredSections.map(s => s.id))) : setSelectedSections(new Set());
  };

  const handleDownloadSelected = () => {
    const sectionsToDownload = sections.filter(s => selectedSections.has(s.id));
    if (sectionsToDownload.length === 0) return;
    const fullContent = sectionsToDownload.map(s => `<h2>${s.title}</h2>${s.content}`).join(module === 'admin' ? '<br style="page-break-after: always;">' : '');
    downloadDoc(`${formData.mata_pelajaran}_Kelas_${formData.kelas}_Pilihan`, fullContent, formData, module);
  };

  const handleDownloadSingle = (section: GeneratedSection) => {
    downloadDoc(
        `${formData.mata_pelajaran}_${section.title.replace(/ /g, '_')}`, 
        `<h2>${section.title}</h2>${section.content}`, 
        formData,
        module
    );
  };
  
  const handlePlayAudio = async (section: GeneratedSection) => {
    if (isAudioFeatureDisabled) return;

    if (audioState.isPlaying && audioState.sectionId === section.id) {
        audioState.source?.stop();
        audioState.audioContext?.close();
        setAudioState({ isPlaying: false, sectionId: null, audioContext: null, source: null });
        return;
    }
    
    if (audioState.source) {
        audioState.source.stop();
        audioState.audioContext?.close();
    }
    
    setAudioState({ isPlaying: true, sectionId: section.id, audioContext: null, source: null });
    
    try {
        const plainText = new DOMParser().parseFromString(section.content, 'text/html').body.textContent || '';
        const audioBuffer = await textToSpeech(`${section.title}. ${plainText}`);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
            setAudioState({ isPlaying: false, sectionId: null, audioContext: null, source: null });
            audioContext.close();
        };
        source.start();
        setAudioState({ isPlaying: true, sectionId: section.id, audioContext, source });
    } catch (error: any) {
        const errorMessage = error.toString();
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            console.warn("TTS quota exceeded. Disabling audio playback for this session.");
            setIsAudioFeatureDisabled(true);
        } else {
            console.error("TTS Error:", error);
        }
        setAudioState({ isPlaying: false, sectionId: null, audioContext: null, source: null });
    }
  };

  const isAllSelected = filteredSections.length > 0 && filteredSections.every(s => selectedSections.has(s.id));

  // Updated CSS classes for the editor to match Word layout
  // [&_ol]:list-decimal -> Main list numbers
  // [&_ol]:pl-10 -> Padding for main list
  // [&_li]:mb-4 -> Space between questions
  // [&_ol[type='A']]:list-[upper-alpha] -> Option list letters
  // [&_ol[type='A']_li]:mb-1 -> Tighter space for options
  const editorClasses = "prose max-w-none focus:outline-none overflow-x-auto " +
    "[&_ol]:list-decimal [&_ol]:pl-8 " + 
    "[&_li]:mb-3 [&_li]:leading-relaxed " + 
    "[&_ul]:list-disc [&_ul]:pl-8 " + 
    "[&_ol[type='A']]:list-[upper-alpha] [&_ol[type='A']]:pl-6 [&_ol[type='A']]:mt-2 " +
    "[&_ol[type='A']_li]:mb-1";

  return (
    <div id="results-section" className="bg-white rounded-lg card-shadow p-6 fade-in">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4 border-b pb-6">
        <div>
            <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2">&larr; Kembali ke Dashboard</button>
            <h2 className="text-2xl font-bold text-gray-900">Hasil Generator (Dapat Diedit)</h2>
            <p className="text-gray-500 text-sm mt-1">{formData.mata_pelajaran} - Kelas {formData.kelas} - {formData.tahun_ajaran}</p>
        </div>
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button onClick={onSaveSession} className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600 shadow-sm transition-colors">💾 Simpan Sesi</button>
          <button onClick={handleDownloadSelected} disabled={selectedSections.size === 0} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300 shadow-sm transition-colors">📥 Download Pilihan ({selectedSections.size})</button>
          <button onClick={onNewGeneration} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 shadow-sm transition-colors">➕ Generate Baru</button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Filter Konten</label>
        <div className="flex flex-wrap gap-2">
            {filterCategories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        activeFilter === cat 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>
      
      <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
        <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"/>
            <span className="text-sm font-medium text-gray-700">{isAllSelected ? 'Hapus Semua Pilihan' : `Pilih Semua di Kategori ${activeFilter}`}</span>
        </label>
        <span className="text-xs text-gray-500 font-medium">Menampilkan {filteredSections.length} dari {sections.length} bagian</span>
      </div>

      <div id="generated-content" className="space-y-6">
        {filteredSections.map(section => (
          <div key={section.id} className="flex items-start space-x-3 group">
            <input type="checkbox" aria-label={`Pilih ${section.title}`} checked={selectedSections.has(section.id)} onChange={() => handleSelectionChange(section.id)} className="h-6 w-6 rounded text-indigo-600 focus:ring-indigo-500 mt-1"/>
            <div className="flex-grow relative p-4 border-2 border-gray-100 rounded-lg hover:border-indigo-200 bg-white transition-all shadow-sm">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10">
                    <button 
                        onClick={() => handlePlayAudio(section)} 
                        title={isAudioFeatureDisabled ? "Fitur audio dinonaktifkan karena kuota terlampaui" : "Dengarkan Teks"} 
                        disabled={isAudioFeatureDisabled}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {audioState.isPlaying && audioState.sectionId === section.id ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>}
                    </button>
                    <button onClick={() => handleDownloadSingle(section)} title="Download Bagian Ini" className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => onDeleteSection(section.id)} title="Hapus Bagian" className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                </div>
                <h3 className="text-lg font-bold text-indigo-800 mb-4 pb-2 border-b border-indigo-50">{section.title}</h3>
                <div 
                    className={editorClasses}
                    contentEditable 
                    suppressContentEditableWarning={true} 
                    onBlur={e => onUpdateSectionContent(section.id, e.currentTarget.innerHTML)} 
                    dangerouslySetInnerHTML={{ __html: section.content }} 
                />
            </div>
          </div>
        ))}
        {filteredSections.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500">Tidak ada konten di kategori <strong>{activeFilter}</strong>.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
