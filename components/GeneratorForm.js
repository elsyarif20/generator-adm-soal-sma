
import React, { useState, useEffect, useRef } from 'react';
import { KELAS_OPTIONS, MATA_PELAJARAN_OPTIONS, ALOKASI_WAKTU_OPTIONS, TEACHER_NAMES } from '../constants.js';
import Spinner from './Spinner.js';

const LOG_STEPS = {
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

const GeneratorForm = ({ module, onSubmit, onBack, onShowAIAssistant, isLoading, generationProgress }) => {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
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
  const [customMataPelajaran, setCustomMataPelajaran] = useState({});
  const [newSubject, setNewSubject] = useState('');
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const processedMilestones = useRef(new Set());

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

  const [kelasOptions, setKelasOptions] = useState([]);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState([]);
  const [alokasiWaktuOptions, setAlokasiWaktuOptions] = useState([]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target;
        setFormData(prev => ({...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') setShowCustomSubject(true);
    else { setShowCustomSubject(false); setFormData(prev => ({ ...prev, mata_pelajaran: value })); }
  };

  const handleCheckboxChange = (e) => {
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

  const handleSubmit = (e) => {
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
    React.createElement("div", { className: "bg-white rounded-lg card-shadow p-6 fade-in" },
      React.createElement("div", { className: "mb-6" },
        React.createElement("button", { onClick: onBack, className: "text-blue-600 hover:text-blue-800 text-sm font-medium mb-4" }, "← Dashboard"),
        React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, title),
        React.createElement("p", { className: "text-gray-600 mt-1" }, description)
      ),

      React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
        React.createElement("div", { className: "grid md:grid-cols-4 gap-6" },
          React.createElement("select", { name: "jenjang", value: formData.jenjang, onChange: handleChange, required: true, className: formElementClasses }, React.createElement("option", { value: "SMA" }, "SMA")),
          React.createElement("select", { name: "kelas", value: formData.kelas, onChange: handleChange, required: true, className: formElementClasses }, React.createElement("option", { value: "" }, "Pilih Kelas"), kelasOptions.map(k => React.createElement("option", { key: k, value: k }, k))),
          React.createElement("select", { name: "mata_pelajaran_select", value: showCustomSubject ? 'custom' : formData.mata_pelajaran, onChange: handleSubjectChange, required: true, className: formElementClasses }, React.createElement("option", { value: "" }, "Pilih Mapel"), mataPelajaranOptions.map(m => React.createElement("option", { key: m, value: m }, m)), React.createElement("option", { value: "custom" }, "Tambah Baru...")),
          React.createElement("select", { name: "bahasa", value: formData.bahasa, onChange: handleChange, className: formElementClasses }, React.createElement("option", null, "Bahasa Indonesia"), React.createElement("option", null, "Bahasa Inggris"), React.createElement("option", null, "Bahasa Arab"))
        ),
        showCustomSubject && (
            React.createElement("div", { className: "flex items-center space-x-2" }, React.createElement("input", { type: "text", value: newSubject, onChange: (e) => setNewSubject(e.target.value), className: `flex-grow ${formElementClasses}`, placeholder: "Nama mapel baru..." }), React.createElement("button", { type: "button", onClick: handleSaveNewSubject, className: "px-4 py-2 bg-green-600 text-white rounded-md" }, "Simpan"))
        ),
        React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
            React.createElement("select", { name: "semester", value: formData.semester, onChange: handleChange, required: true, className: formElementClasses }, React.createElement("option", { value: "1" }, "Semester 1 (Ganjil)"), React.createElement("option", { value: "2" }, "Semester 2 (Genap)")),
            React.createElement("input", { type: "text", name: "tahun_ajaran", value: formData.tahun_ajaran, onChange: handleChange, required: true, className: formElementClasses, placeholder: "Tahun Ajaran" })
        ),
        React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
          React.createElement("input", { type: "text", name: "sekolah", value: formData.sekolah, onChange: handleChange, required: true, className: formElementClasses, placeholder: "Nama Sekolah" }),
          React.createElement("input", { list: "teacher_names", type: "text", name: "nama_guru", value: formData.nama_guru, onChange: handleChange, required: true, className: formElementClasses, placeholder: "Nama Pengajar" }),
          React.createElement("datalist", { id: "teacher_names" },
            TEACHER_NAMES.map((name) => (
                React.createElement("option", { key: name, value: name })
            ))
          )
        ),
        React.createElement("hr", null),

        module === 'admin' && (
          React.createElement("div", { className: "space-y-6" },
             React.createElement("div", { className: "grid md:grid-cols-3 gap-6" },
                React.createElement("select", { name: "fase", value: formData.fase, onChange: handleChange, required: true, className: formElementClasses }, React.createElement("option", { value: "" }, "Pilih Fase"), React.createElement("option", { value: "Fase E" }, "Fase E (10 SMA)"), React.createElement("option", { value: "Fase F" }, "Fase F (11-12 SMA)")),
                React.createElement("select", { name: "alokasi_waktu", value: formData.alokasi_waktu, onChange: handleChange, required: true, className: formElementClasses }, React.createElement("option", { value: "" }, "Alokasi Waktu"), alokasiWaktuOptions.map(aw => React.createElement("option", { key: aw, value: aw }, aw))),
                React.createElement("input", { type: "number", name: "jumlah_modul_ajar", value: formData.jumlah_modul_ajar, onChange: handleChange, required: true, min: "1", max: "10", className: formElementClasses, placeholder: "Jml Modul Ajar" })
            ),
            React.createElement("textarea", { name: "cp_elements", id: "cp_elements", value: formData.cp_elements ?? '', onChange: handleChange, required: true, rows: 4, className: formElementClasses, placeholder: "Elemen Capaian Pembelajaran (CP)..." }),
            React.createElement("button", { type: "button", onClick: () => onShowAIAssistant(formData, 'cp'), className: "text-sm text-blue-600 font-semibold" }, "✨ Saran AI")
          )
        ),
        
        (module === 'soal' || module === 'tryout') && (
           React.createElement("div", { className: "space-y-6" },
                React.createElement("div", null,
                     React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Jenis Soal / Asesmen"),
                     React.createElement("select", { name: "kategori_ujian", value: formData.kategori_ujian || 'UAS', onChange: handleChange, className: formElementClasses },
                        React.createElement("option", { value: "TO" }, "TO (Try Out)"),
                        React.createElement("option", { value: "PTS" }, "PTS (Penilaian Tengah Semester)"),
                        React.createElement("option", { value: "UAS" }, "UAS (Penilaian Akhir Semester)")
                     )
                ),
                
                React.createElement("div", { className: "flex justify-between items-center mb-1" },
                    React.createElement("label", { htmlFor: "topik_materi", className: "block text-sm font-medium text-gray-700" },
                        module === 'tryout' ? 'Daftar Materi Utama Kelas 12' : 'Topik / Materi Spesifik'
                    ),
                    React.createElement("button", { type: "button", onClick: () => onShowAIAssistant(formData, 'topic'), className: "text-sm text-blue-600 font-semibold flex items-center" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement("path", { fillRule: "evenodd", d: "M11.3 1.047a1 1 0 01.897.95l.407 8.14a1 1 0 00.95.95l8.14.407a1 1 0 01.95.897 1 1 0 01-.95.897l-8.14.407a1 1 0 00-.95.95l-.407 8.14a1 1 0 01-.897.95 1 1 0 01-.897-.95l-.407-8.14a1 1 0 00-.95-.95l-8.14-.407a1 1 0 01-.95-.897 1 1 0 01.95-.897l8.14-.407a1 1 0 00.95-.95l.407-8.14a1 1 0 01.897-.95z", clipRule: "evenodd" })),
                        "✨ Saran AI"
                    )
                ),
                React.createElement("textarea", { 
                    name: "topik_materi", 
                    id: "topik_materi",
                    value: formData.topik_materi ?? '', 
                    onChange: handleChange, 
                    required: true, 
                    rows: module === 'tryout' ? 5 : 3, 
                    className: formElementClasses, 
                    placeholder: module === 'tryout' 
                        ? "Masukkan materi-materi utama khusus Kelas 12 yang akan diujikan (Contoh: Turunan, Integral, Statistika...)" 
                        : "Masukkan topik atau materi spesifik yang ingin dibuatkan soalnya..."
                }),

                module === 'soal' && (
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "flex flex-wrap gap-4" },
                             React.createElement("label", { className: "flex items-center space-x-2" }, React.createElement("input", { type: "checkbox", name: "Pilihan Ganda", checked: formData.jenis_soal?.includes('Pilihan Ganda'), onChange: handleCheckboxChange }), React.createElement("span", null, "PG Standar")),
                             React.createElement("label", { className: "flex items-center space-x-2" }, React.createElement("input", { type: "checkbox", name: "Uraian", checked: formData.jenis_soal?.includes('Uraian'), onChange: handleCheckboxChange }), React.createElement("span", null, "Uraian Standar")),
                             React.createElement("label", { className: "flex items-center space-x-2" }, React.createElement("input", { type: "checkbox", name: "sertakan_soal_tka", checked: !!formData.sertakan_soal_tka, onChange: handleChange }), React.createElement("span", null, "Sertakan Soal TKA"))
                        ),

                        React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
                            formData.jenis_soal?.includes('Pilihan Ganda') && (
                                 React.createElement("div", null,
                                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Jumlah PG Standar"),
                                    React.createElement("input", { type: "number", name: "jumlah_pg", value: formData.jumlah_pg, onChange: handleChange, className: formElementClasses, placeholder: "0" })
                                 )
                            ),
                            formData.jenis_soal?.includes('Uraian') && (
                                React.createElement("div", null,
                                     React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Jumlah Uraian Standar"),
                                     React.createElement("input", { type: "number", name: "jumlah_uraian", value: formData.jumlah_uraian, onChange: handleChange, className: formElementClasses, placeholder: "0" })
                                )
                            )
                        ),

                        formData.sertakan_soal_tka && (
                            React.createElement("div", { className: "p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md space-y-4" },
                                React.createElement("h4", { className: "font-bold text-blue-800" }, "Konfigurasi Soal TKA"),
                                React.createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Jumlah PG TKA"),
                                        React.createElement("input", { type: "number", name: "jumlah_soal_tka", value: formData.jumlah_soal_tka, onChange: handleChange, className: formElementClasses, placeholder: "0" })
                                    ),
                                    React.createElement("div", null,
                                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Jumlah Essay TKA"),
                                        React.createElement("input", { type: "number", name: "jumlah_soal_tka_uraian", value: formData.jumlah_soal_tka_uraian, onChange: handleChange, className: formElementClasses, placeholder: "0" })
                                    ),
                                     React.createElement("div", { className: "md:col-span-2" },
                                        React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Kelompok TKA"),
                                        React.createElement("select", { name: "kelompok_tka", value: formData.kelompok_tka, onChange: handleChange, className: formElementClasses },
                                            React.createElement("option", { value: "saintek" }, "Kelompok Saintek"),
                                            React.createElement("option", { value: "soshum" }, "Kelompok Soshum")
                                        )
                                    )
                                )
                            )
                        ),

                        React.createElement("div", null,
                             React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Tingkat Kesulitan"),
                             React.createElement("select", { name: "tingkat_kesulitan", value: formData.tingkat_kesulitan, onChange: handleChange, className: formElementClasses }, React.createElement("option", null, "Mudah"), React.createElement("option", null, "Sedang"), React.createElement("option", null, "Sulit (HOTS)"))
                        )
                    )
                ),

                module === 'tryout' && (
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800" },
                            React.createElement("p", { className: "font-bold" }, "Konfigurasi Try Out / UAS Kelas 12"),
                            React.createElement("p", { className: "text-sm" }, "Tentukan jumlah soal untuk setiap kategori di bawah ini.")
                        ),
                        
                        React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Jumlah Soal Standar"),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                     React.createElement("input", { type: "number", name: "jumlah_pg", value: formData.jumlah_pg, onChange: handleChange, className: formElementClasses, placeholder: "Jml PG" }),
                                     React.createElement("input", { type: "number", name: "jumlah_uraian", value: formData.jumlah_uraian, onChange: handleChange, className: formElementClasses, placeholder: "Jml Essay" })
                                )
                            ),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Jumlah Soal TKA (Akademik)"),
                                React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                                     React.createElement("input", { type: "number", name: "jumlah_soal_tka", value: formData.jumlah_soal_tka, onChange: handleChange, className: formElementClasses, placeholder: "Jml PG TKA" }),
                                     React.createElement("input", { type: "number", name: "jumlah_soal_tka_uraian", value: formData.jumlah_soal_tka_uraian, onChange: handleChange, className: formElementClasses, placeholder: "Jml Essay TKA" })
                                )
                            )
                        ),

                        React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
                            React.createElement("select", { name: "kelompok_tka", value: formData.kelompok_tka, onChange: handleChange, className: formElementClasses },
                                React.createElement("option", { value: "saintek" }, "Kelompok Saintek"),
                                React.createElement("option", { value: "soshum" }, "Kelompok Soshum")
                            ),
                            React.createElement("select", { name: "tingkat_kesulitan", value: formData.tingkat_kesulitan, onChange: handleChange, className: formElementClasses },
                                React.createElement("option", null, "Mudah"),
                                React.createElement("option", null, "Sedang"),
                                React.createElement("option", null, "Sulit (HOTS)")
                            )
                        ),

                        React.createElement("div", { className: "flex flex-wrap gap-4" },
                            React.createElement("label", { className: "flex items-center space-x-2" }, React.createElement("input", { type: "checkbox", name: "Pilihan Ganda", checked: formData.jenis_soal?.includes('Pilihan Ganda'), onChange: handleCheckboxChange }), React.createElement("span", null, "Sertakan PG")),
                            React.createElement("label", { className: "flex items-center space-x-2" }, React.createElement("input", { type: "checkbox", name: "Uraian", checked: formData.jenis_soal?.includes('Uraian'), onChange: handleCheckboxChange }), React.createElement("span", null, "Sertakan Essay"))
                        )
                    )
                )
           )
        ),

        React.createElement("div", { className: "p-4 bg-gray-100 rounded-lg flex items-center justify-between" },
            React.createElement("span", { className: "font-semibold text-gray-700" }, "🧠 Mode Cerdas (HOTS)"), 
            React.createElement("input", { type: "checkbox", name: "use_thinking_mode", checked: !!formData.use_thinking_mode, onChange: handleChange, className: "toggle toggle-primary" })
        ),

        isLoading && (
            React.createElement("div", { className: "my-4" },
                React.createElement("div", { className: "flex justify-between mb-1" }, React.createElement("span", { className: "font-medium text-indigo-700" }, "AI Sedang Bekerja..."), React.createElement("span", { className: "font-medium text-indigo-700" }, `${Math.round(generationProgress)}%`)),
                React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2.5 mb-4" }, React.createElement("div", { className: "bg-indigo-600 h-2.5 rounded-full", style: { width: `${generationProgress}%` } })),
                React.createElement("div", { className: "bg-gray-900 rounded-md p-4 h-32 overflow-y-auto font-mono text-xs text-green-400" },
                    logs.map((log, i) => React.createElement("p", { key: i }, log)),
                    React.createElement("div", { ref: logsEndRef })
                )
            )
        ),

        React.createElement("div", { className: "flex justify-end pt-2" },
            React.createElement("button", { type: "submit", disabled: isLoading, className: "px-6 py-2 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400" },
                isLoading ? React.createElement(Spinner, null) : 'Generate'
            )
        )
      )
    )
  );
};

export default GeneratorForm;
