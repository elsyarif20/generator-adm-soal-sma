
import React, { useState, useEffect, useRef } from 'react';
import { Module, FormData } from '../types';
import { KELAS_OPTIONS, MATA_PELAJARAN_OPTIONS, ALOKASI_WAKTU_OPTIONS, TEACHER_NAMES } from '../constants';
import Spinner from './Spinner';

interface GeneratorFormProps {
  module: Module;
  onSubmit: (formData: FormData) => void;
  onBack: () => void;
  onShowAIAssistant: (data: Partial<FormData>, type: 'cp' | 'topic') => void;
  isLoading: boolean;
  generationProgress: number;
}

const LOG_STEPS: Record<string, { progress: number; message: string }[]> = {
    admin: [
        { progress: 5, message: "Menginisialisasi Model AI..." },
        { progress: 15, message: "Menganalisis Capaian Pembelajaran (CP) & Fase..." },
        { progress: 30, message: "Menyusun Alur Tujuan Pembelajaran (ATP)..." },
        { progress: 45, message: "Meng-generate Prota & Promes..." },
        { progress: 60, message: "Merancang Modul Ajar..." },
        { progress: 75, message: "Menyusun KKTP..." },
        { progress: 90, message: "Finalisasi format dokumen..." },
        { progress: 100, message: "Selesai!" }
    ],
    soal: [
        { progress: 5, message: "Menginisialisasi Model AI..." },
        { progress: 15, message: "Menganalisis Topik..." },
        { progress: 30, message: "Menyusun Kisi-kisi Soal..." },
        { progress: 50, message: "Meng-generate Naskah Soal..." },
        { progress: 70, message: "Membuat Kunci Jawaban..." },
        { progress: 85, message: "Melakukan Analisis Kualitatif..." },
        { progress: 95, message: "Finalisasi format dokumen..." },
        { progress: 100, message: "Selesai!" }
    ],
    tryout: [
        { progress: 5, message: "Menginisialisasi Model AI..." },
        { progress: 15, message: "Menganalisis Kurikulum Kelas 12 SMA..." },
        { progress: 30, message: "Merumuskan Kisi-kisi Try Out/UAS Kelas 12..." },
        { progress: 50, message: "Meng-generate Soal Standar Kelas 12..." },
        { progress: 70, message: "Meng-generate Soal TKA (Akademik)..." },
        { progress: 85, message: "Finalisasi Kunci Jawaban & Rubrik..." },
        { progress: 100, message: "Selesai!" }
    ]
};

const GeneratorForm: React.FC<GeneratorFormProps> = ({ module, onSubmit, onBack, onShowAIAssistant, isLoading, generationProgress }) => {
  const [formData, setFormData] = useState<FormData>(() => {
    const defaultData: FormData = {
      jenjang: 'SMA',
      kelas: '', semester: '1', mata_pelajaran: '', 
      sekolah: 'SMA ISLAM AL-GHOZALI',
      tahun_ajaran: '2025-2026', nama_guru: '', fase: '',
      cp_elements: '', alokasi_waktu: '', jumlah_modul_ajar: 1,
      topik_materi: '', sertakan_kisi_kisi: true, sertakan_soal_tka: false,
      jumlah_soal_tka: 10, sertakan_soal_tka_uraian: false, jumlah_soal_tka_uraian: 5,
      kelompok_tka: 'saintek',
      kategori_ujian: 'UAS', // Default assessment type
      jenis_soal: ['Pilihan Ganda', 'Uraian'], jumlah_pg: 30, jumlah_uraian: 4,
      jumlah_isian_singkat: 0, 
      soal_pesantren_sections: [],
      tingkat_kesulitan: 'Sedang', bahasa: 'Bahasa Indonesia',
      yayasan: 'YPI PONDOK MODERN AL-GHOZALI',
      alamat_sekolah: 'Jl. Permata No. 19 Curug Gunungsindur Kab. Bogor 16340',
      logo_sekolah: '',
      judul_asesmen: module === 'tryout' ? 'TRY OUT UJIAN AKHIR SEKOLAH' : 'PENILAIAN SUMATIF AKHIR SEMESTER GANJIL',
      tanggal_ujian: '',
      jam_ke: '', waktu_ujian: '90 Menit', use_thinking_mode: false,
    };
    try {
        const savedData = localStorage.getItem('guruAppData');
        if (savedData) return { ...defaultData, ...JSON.parse(savedData) };
    } catch (error) {}
    return defaultData;
  });
  
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [customMataPelajaran, setCustomMataPelajaran] = useState<Record<string, string[]>>({});
  const [newSubject, setNewSubject] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const processedMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    try {
        const savedCustomSubjects = localStorage.getItem('customMataPelajaran');
        if (savedCustomSubjects) setCustomMataPelajaran(JSON.parse(savedCustomSubjects));
    } catch (error) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('customMataPelajaran', JSON.stringify(customMataPelajaran));
  }, [customMataPelajaran]);

  useEffect(() => {
    const { sekolah, nama_guru, yayasan, alamat_sekolah, jenjang, kelas, mata_pelajaran, tahun_ajaran, bahasa, semester } = formData;
    localStorage.setItem('guruAppData', JSON.stringify({ sekolah, nama_guru, yayasan, alamat_sekolah, jenjang, kelas, mata_pelajaran, tahun_ajaran, bahasa, semester }));
  }, [formData]);

  useEffect(() => {
    if (formData.jenjang) {
      setKelasOptions(KELAS_OPTIONS[formData.jenjang] || []);
      const baseSubjects = MATA_PELAJARAN_OPTIONS[formData.jenjang] || [];
      const customSubjectsForJenjang = customMataPelajaran[formData.jenjang] || [];
      const combinedSubjects = [...new Set([...baseSubjects, ...customSubjectsForJenjang])].sort();
      setMataPelajaranOptions(combinedSubjects);
      setAlokasiWaktuOptions(ALOKASI_WAKTU_OPTIONS[formData.jenjang] || []);
      setShowCustomSubject(false);
    }
  }, [formData.jenjang, customMataPelajaran]);
  
  useEffect(() => {
    const { jenjang, kelas } = formData;
    let newFase = '';
    const kelasNum = parseInt(kelas, 10);
    if (jenjang === 'SMA') newFase = kelasNum === 10 ? 'Fase E' : 'Fase F';
    if (newFase !== formData.fase) setFormData(prev => ({ ...prev, fase: newFase }));
  }, [formData.jenjang, formData.kelas]);

  useEffect(() => {
    if (!isLoading) { setLogs([]); processedMilestones.current.clear(); return; }
    const steps = LOG_STEPS[module] || [];
    steps.forEach((step) => {
        if (generationProgress >= step.progress && !processedMilestones.current.has(step.progress)) {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] > ${step.message}`]);
            processedMilestones.current.add(step.progress);
        }
    });
  }, [isLoading, generationProgress, module]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const [kelasOptions, setKelasOptions] = useState<string[]>([]);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState<string[]>([]);
  const [alokasiWaktuOptions, setAlokasiWaktuOptions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') setShowCustomSubject(true);
    else { setShowCustomSubject(false); setFormData(prev => ({ ...prev, mata_pelajaran: value })); }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => {
      const newJenisSoal = checked ? [...(prev.jenis_soal || []), name] : (prev.jenis_soal || []).filter(item => item !== name);
      return { ...prev, jenis_soal: newJenisSoal };
    });
  };

  const handleSaveNewSubject = () => {
    const trimmedSubject = newSubject.trim();
    if (trimmedSubject && formData.jenjang) {
        setCustomMataPelajaran(prev => ({ ...prev, [formData.jenjang]: [...(prev[formData.jenjang] || []), trimmedSubject] }));
        setFormData(prev => ({ ...prev, mata_pelajaran: trimmedSubject }));
        setShowCustomSubject(false);
        setNewSubject('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (module === 'soal' || module === 'tryout') {
        const selectedTypes = formData.jenis_soal || [];
        if (selectedTypes.length === 0) { alert("Pilih minimal satu jenis soal."); return; }
    }
    onSubmit(formData);
  };

  const title = module === 'admin' ? 'Generator Administrasi Guru' : module === 'soal' ? 'Generator Bank Soal' : 'Generator Try Out & UAS';
  const description = module === 'admin' 
    ? 'Lengkapi form untuk menghasilkan ATP, Prota, Promes, Modul Ajar, KKTP, dan Jurnal Harian.' 
    : module === 'soal' ? 'Lengkapi form untuk menghasilkan bank soal dan perangkat asesmen adaptif.'
    : 'Lengkapi form untuk menghasilkan soal Try Out/UAS Berfokus pada materi Kelas 12 & Soal TKA.';
  const formElementClasses = "w-full rounded-md border-2 border-gray-300 focus:border-indigo-500 focus:ring-1 transition duration-150";

  return (
    <div className="bg-white rounded-lg card-shadow p-6 fade-in">
      <div className="mb-6">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">&larr; Dashboard</button>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          <select name="jenjang" value={formData.jenjang} onChange={handleChange} required className={formElementClasses}><option value="SMA">SMA</option></select>
          <select name="kelas" value={formData.kelas} onChange={handleChange} required className={formElementClasses}><option value="">Pilih Kelas</option>{kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}</select>
          <select name="mata_pelajaran_select" value={showCustomSubject ? 'custom' : formData.mata_pelajaran} onChange={handleSubjectChange} required className={formElementClasses}><option value="">Pilih Mapel</option>{mataPelajaranOptions.map(m => <option key={m} value={m}>{m}</option>)}<option value="custom">Tambah Baru...</option></select>
          <select name="bahasa" value={formData.bahasa} onChange={handleChange} className={formElementClasses}><option>Bahasa Indonesia</option><option>Bahasa Inggris</option><option>Bahasa Arab</option></select>
        </div>
        {showCustomSubject && (
            <div className="flex items-center space-x-2"><input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className={`flex-grow ${formElementClasses}`} placeholder="Nama mapel baru..." /><button type="button" onClick={handleSaveNewSubject} className="px-4 py-2 bg-green-600 text-white rounded-md">Simpan</button></div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
            <select name="semester" value={formData.semester} onChange={handleChange} required className={formElementClasses}><option value="1">Semester 1 (Ganjil)</option><option value="2">Semester 2 (Genap)</option></select>
            <input type="text" name="tahun_ajaran" value={formData.tahun_ajaran} onChange={handleChange} required className={formElementClasses} placeholder="Tahun Ajaran" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <input type="text" name="sekolah" value={formData.sekolah} onChange={handleChange} required className={formElementClasses} placeholder="Nama Sekolah" />
          <input list="teacher_names" type="text" name="nama_guru" value={formData.nama_guru} onChange={handleChange} required className={formElementClasses} placeholder="Nama Pengajar" />
          <datalist id="teacher_names">
            {TEACHER_NAMES.map((name) => (
                <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <hr/>

        {module === 'admin' && (
          <div className="space-y-6">
             <div className="grid md:grid-cols-3 gap-6">
                <select name="fase" value={formData.fase} onChange={handleChange} required className={formElementClasses}><option value="">Pilih Fase</option><option value="Fase E">Fase E (10 SMA)</option><option value="Fase F">Fase F (11-12 SMA)</option></select>
                <select name="alokasi_waktu" value={formData.alokasi_waktu} onChange={handleChange} required className={formElementClasses}><option value="">Alokasi Waktu</option>{alokasiWaktuOptions.map(aw => <option key={aw} value={aw}>{aw}</option>)}</select>
                <input type="number" name="jumlah_modul_ajar" value={formData.jumlah_modul_ajar} onChange={handleChange} required min="1" max="10" className={formElementClasses} placeholder="Jml Modul Ajar" />
            </div>
            <textarea name="cp_elements" id="cp_elements" value={formData.cp_elements ?? ''} onChange={handleChange} required rows={4} className={formElementClasses} placeholder="Elemen Capaian Pembelajaran (CP)..."></textarea>
            <button type="button" onClick={() => onShowAIAssistant(formData, 'cp')} className="text-sm text-blue-600 font-semibold">✨ Saran AI</button>
          </div>
        )}
        
        {(module === 'soal' || module === 'tryout') && (
           <div className="space-y-6">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Soal / Asesmen</label>
                     <select name="kategori_ujian" value={formData.kategori_ujian || 'UAS'} onChange={handleChange} className={formElementClasses}>
                        <option value="TO">TO (Try Out)</option>
                        <option value="PTS">PTS (Penilaian Tengah Semester)</option>
                        <option value="UAS">UAS (Penilaian Akhir Semester)</option>
                     </select>
                </div>
                
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="topik_materi" className="block text-sm font-medium text-gray-700">
                        {module === 'tryout' ? 'Daftar Materi Utama Kelas 12' : 'Topik / Materi Spesifik'}
                    </label>
                    <button type="button" onClick={() => onShowAIAssistant(formData, 'topic')} className="text-sm text-blue-600 font-semibold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l.407 8.14a1 1 0 00.95.95l8.14.407a1 1 0 01.95.897 1 1 0 01-.95.897l-8.14.407a1 1 0 00-.95.95l-.407 8.14a1 1 0 01-.897.95 1 1 0 01-.897-.95l-.407-8.14a1 1 0 00-.95-.95l-8.14-.407a1 1 0 01-.95-.897 1 1 0 01.95-.897l8.14-.407a1 1 0 00.95-.95l.407-8.14a1 1 0 01.897-.95z" clipRule="evenodd" /></svg>
                        ✨ Saran AI
                    </button>
                </div>
                <textarea 
                    name="topik_materi" 
                    id="topik_materi"
                    value={formData.topik_materi ?? ''} 
                    onChange={handleChange} 
                    required 
                    rows={module === 'tryout' ? 5 : 3} 
                    className={formElementClasses} 
                    placeholder={module === 'tryout' 
                        ? "Masukkan materi-materi utama khusus Kelas 12 yang akan diujikan (Contoh: Turunan, Integral, Statistika...)" 
                        : "Masukkan topik atau materi spesifik yang ingin dibuatkan soalnya..."}
                ></textarea>

                {module === 'soal' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                             <label className="flex items-center space-x-2"><input type="checkbox" name="Pilihan Ganda" checked={formData.jenis_soal?.includes('Pilihan Ganda')} onChange={handleCheckboxChange}/> <span>PG Standar</span></label>
                             <label className="flex items-center space-x-2"><input type="checkbox" name="Uraian" checked={formData.jenis_soal?.includes('Uraian')} onChange={handleCheckboxChange}/> <span>Uraian Standar</span></label>
                             <label className="flex items-center space-x-2"><input type="checkbox" name="sertakan_soal_tka" checked={!!formData.sertakan_soal_tka} onChange={handleChange}/> <span>Sertakan Soal TKA</span></label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {formData.jenis_soal?.includes('Pilihan Ganda') && (
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah PG Standar</label>
                                    <input type="number" name="jumlah_pg" value={formData.jumlah_pg} onChange={handleChange} className={formElementClasses} placeholder="0" />
                                 </div>
                            )}
                            {formData.jenis_soal?.includes('Uraian') && (
                                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Uraian Standar</label>
                                     <input type="number" name="jumlah_uraian" value={formData.jumlah_uraian} onChange={handleChange} className={formElementClasses} placeholder="0" />
                                </div>
                            )}
                        </div>

                        {formData.sertakan_soal_tka && (
                            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md space-y-4">
                                <h4 className="font-bold text-blue-800">Konfigurasi Soal TKA</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah PG TKA</label>
                                        <input type="number" name="jumlah_soal_tka" value={formData.jumlah_soal_tka} onChange={handleChange} className={formElementClasses} placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Essay TKA</label>
                                        <input type="number" name="jumlah_soal_tka_uraian" value={formData.jumlah_soal_tka_uraian} onChange={handleChange} className={formElementClasses} placeholder="0" />
                                    </div>
                                     <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kelompok TKA</label>
                                        <select name="kelompok_tka" value={formData.kelompok_tka} onChange={handleChange} className={formElementClasses}>
                                            <option value="saintek">Kelompok Saintek</option>
                                            <option value="soshum">Kelompok Soshum</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Kesulitan</label>
                             <select name="tingkat_kesulitan" value={formData.tingkat_kesulitan} onChange={handleChange} className={formElementClasses}><option>Mudah</option><option>Sedang</option><option>Sulit (HOTS)</option></select>
                        </div>
                    </div>
                )}

                {module === 'tryout' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800">
                            <p className="font-bold">Konfigurasi Try Out / UAS Kelas 12</p>
                            <p className="text-sm">Tentukan jumlah soal untuk setiap kategori di bawah ini.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Soal Standar</label>
                                <div className="grid grid-cols-2 gap-2">
                                     <input type="number" name="jumlah_pg" value={formData.jumlah_pg} onChange={handleChange} className={formElementClasses} placeholder="Jml PG" />
                                     <input type="number" name="jumlah_uraian" value={formData.jumlah_uraian} onChange={handleChange} className={formElementClasses} placeholder="Jml Essay" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Soal TKA (Akademik)</label>
                                <div className="grid grid-cols-2 gap-2">
                                     <input type="number" name="jumlah_soal_tka" value={formData.jumlah_soal_tka} onChange={handleChange} className={formElementClasses} placeholder="Jml PG TKA" />
                                     <input type="number" name="jumlah_soal_tka_uraian" value={formData.jumlah_soal_tka_uraian} onChange={handleChange} className={formElementClasses} placeholder="Jml Essay TKA" />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <select name="kelompok_tka" value={formData.kelompok_tka} onChange={handleChange} className={formElementClasses}>
                                <option value="saintek">Kelompok Saintek</option>
                                <option value="soshum">Kelompok Soshum</option>
                            </select>
                            <select name="tingkat_kesulitan" value={formData.tingkat_kesulitan} onChange={handleChange} className={formElementClasses}>
                                <option>Mudah</option>
                                <option>Sedang</option>
                                <option>Sulit (HOTS)</option>
                            </select>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center space-x-2"><input type="checkbox" name="Pilihan Ganda" checked={formData.jenis_soal?.includes('Pilihan Ganda')} onChange={handleCheckboxChange}/> <span>Sertakan PG</span></label>
                            <label className="flex items-center space-x-2"><input type="checkbox" name="Uraian" checked={formData.jenis_soal?.includes('Uraian')} onChange={handleCheckboxChange}/> <span>Sertakan Essay</span></label>
                        </div>
                    </div>
                )}
           </div>
        )}

        <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between">
            <span className="font-semibold text-gray-700">🧠 Mode Cerdas (HOTS)</span> 
            <input type="checkbox" name="use_thinking_mode" checked={!!formData.use_thinking_mode} onChange={handleChange} className="toggle toggle-primary" />
        </div>

        {isLoading && (
            <div className="my-4">
                <div className="flex justify-between mb-1"><span className="font-medium text-indigo-700">AI Sedang Bekerja...</span><span className="font-medium text-indigo-700">{Math.round(generationProgress)}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${generationProgress}%` }}></div></div>
                <div className="bg-gray-900 rounded-md p-4 h-32 overflow-y-auto font-mono text-xs text-green-400">
                    {logs.map((log, i) => <p key={i}>{log}</p>)}
                    <div ref={logsEndRef} />
                </div>
            </div>
        )}

        <div className="flex justify-end pt-2">
            <button type="submit" disabled={isLoading} className="px-6 py-2 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {isLoading ? <Spinner /> : 'Generate'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default GeneratorForm;
