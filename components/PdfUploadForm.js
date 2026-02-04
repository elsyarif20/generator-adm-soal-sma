
import React, { useState, useEffect, useRef } from 'react';
import { KELAS_OPTIONS, MATA_PELAJARAN_OPTIONS, TEACHER_NAMES } from '../constants.js';
import Spinner from './Spinner.js';

const LOG_STEPS = {
    super: [
        { progress: 5, message: "Menginisialisasi Model AI Terpusat..." },
        { progress: 15, message: "Menganalisis konten buku ajar..." },
        { progress: 30, message: "Menyusun kerangka administrasi (ATP, Prota)..." },
        { progress: 45, message: "Merancang Modul Ajar..." },
        { progress: 60, message: "Menyusun kerangka bank soal (Kisi-kisi)..." },
        { progress: 75, message: "Meng-generate butir soal & kunci jawaban..." },
        { progress: 90, message: "Finalisasi & format gabungan..." },
        { progress: 100, message: "Selesai!" }
    ]
};

const SuperGenerator = ({ onSubmit, onBack, isLoading, generationProgress }) => {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      jenjang: 'SMA', // Default to SMA
      kelas: '', semester: '1', mata_pelajaran: '',
      sekolah: 'SEKOLAH MENENGAH ATAS (SMA) ISLAM AL-GHOZALI',
      tahun_ajaran: '2025-2026', nama_guru: '',
      use_thinking_mode: false,
    };
    try {
      const savedData = localStorage.getItem('guruAppData');
      if (savedData) return { ...defaultData, ...JSON.parse(savedData) };
    } catch (error) { console.error("Failed to load saved form data", error); }
    return defaultData;
  });

  const [textContent, setTextContent] = useState('');
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState([]);
  
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const processedMilestones = useRef(new Set());

  useEffect(() => {
    try {
        const { sekolah, nama_guru, jenjang, kelas, mata_pelajaran, tahun_ajaran, semester } = formData;
        const dataToSave = { sekolah, nama_guru, jenjang, kelas, mata_pelajaran, tahun_ajaran, semester };
        localStorage.setItem('guruAppData', JSON.stringify(dataToSave));
    } catch (error) { console.error("Failed to save form data", error); }
  }, [formData]);

  useEffect(() => {
    if (formData.jenjang) {
      setKelasOptions(KELAS_OPTIONS[formData.jenjang] || []);
      setMataPelajaranOptions(MATA_PELAJARAN_OPTIONS[formData.jenjang] || []);
    }
  }, [formData.jenjang]);
  
  useEffect(() => {
    if (!isLoading) { setLogs([]); processedMilestones.current.clear(); return; }
    const steps = LOG_STEPS.super;
    steps.forEach((step) => {
        if (generationProgress >= step.progress && !processedMilestones.current.has(step.progress)) {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] > ${step.message}`]);
            processedMilestones.current.add(step.progress);
        }
    });
  }, [isLoading, generationProgress]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTextChange = (e) => {
    setTextContent(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textContent.trim()) {
      alert('Silakan salin dan tempel teks buku ajar terlebih dahulu.');
      return;
    }
    onSubmit(formData, textContent);
  };
  
  const formElementClasses = "w-full rounded-md border-2 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 ease-in-out";

  return (
    React.createElement("div", { className: "bg-white rounded-lg card-shadow p-6 fade-in" },
      React.createElement("div", { className: "mb-6" },
        React.createElement("button", { onClick: onBack, className: "text-blue-600 hover:text-blue-800 text-sm font-medium mb-4" }, "← Kembali ke Dashboard"),
        React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Generator Terpusat"),
        React.createElement("p", { className: "text-gray-600 mt-1" }, "Gunakan konten dari buku ajar (PDF/Dokumen) untuk menghasilkan Administrasi Guru dan Bank Soal secara bersamaan.")
      ),

      React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
        React.createElement("div", { className: "grid md:grid-cols-3 gap-6" },
          React.createElement("select", { id: "jenjang", name: "jenjang", value: formData.jenjang, onChange: handleChange, required: true, className: formElementClasses, "aria-label": "Jenjang" },
            React.createElement("option", { value: "SMA" }, "SMA")
          ),
          React.createElement("select", { id: "kelas", name: "kelas", value: formData.kelas, onChange: handleChange, required: true, disabled: !formData.jenjang, className: `${formElementClasses} disabled:bg-gray-100`, "aria-label": "Kelas" }, React.createElement("option", { value: "" }, "Pilih Kelas"), kelasOptions.map(k => React.createElement("option", { key: k, value: k }, k))),
          React.createElement("select", { id: "mata_pelajaran", name: "mata_pelajaran", value: formData.mata_pelajaran, onChange: handleChange, required: true, disabled: !formData.jenjang, className: `${formElementClasses} disabled:bg-gray-100`, "aria-label": "Mata Pelajaran" }, React.createElement("option", { value: "" }, "Pilih Mapel"), mataPelajaranOptions.map(m => React.createElement("option", { key: m, value: m }, m)))
        ),
        React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
            React.createElement("input", { type: "text", id: "sekolah", name: "sekolah", value: formData.sekolah, onChange: handleChange, required: true, className: formElementClasses, placeholder: "Nama Sekolah" }),
            React.createElement("input", { list: "teacher_names", type: "text", id: "nama_guru", name: "nama_guru", value: formData.nama_guru, onChange: handleChange, required: true, className: formElementClasses, placeholder: "Nama Pengajar" }),
            React.createElement("datalist", { id: "teacher_names" },
                TEACHER_NAMES.map((name) => (
                    React.createElement("option", { key: name, value: name })
                ))
            )
        ),
         React.createElement("div", { className: "grid md:grid-cols-2 gap-6" },
            React.createElement("select", { id: "semester", name: "semester", value: formData.semester, onChange: handleChange, required: true, className: formElementClasses, "aria-label": "Semester" },
                React.createElement("option", { value: "1" }, "Semester 1 (Ganjil)"),
                React.createElement("option", { value: "2" }, "Semester 2 (Genap)")
            ),
            React.createElement("input", { type: "text", id: "tahun_ajaran", name: "tahun_ajaran", value: formData.tahun_ajaran, onChange: handleChange, required: true, className: formElementClasses, placeholder: "Tahun Ajaran" })
        ),
        React.createElement("hr", null),
        
        React.createElement("div", null,
          React.createElement("label", { htmlFor: "text-content-input", className: "block text-lg font-medium text-gray-800 mb-2" }, "Salin & Tempel Teks Buku Ajar"),
           React.createElement("p", { className: "text-sm text-gray-600 mb-3" },
            "Buka file PDF/dokumen buku ajar Anda, pilih dan salin (Ctrl+C) teks yang relevan, lalu tempel (Ctrl+V) di kolom di bawah ini."
          ),
          React.createElement("textarea", {
            id: "text-content-input",
            value: textContent,
            onChange: handleTextChange,
            rows: 15,
            className: `${formElementClasses} bg-gray-50`,
            placeholder: "Tempelkan konten teks dari buku ajar Anda di sini...",
            required: true
          })
        ),
        
        React.createElement("div", { className: "p-4 bg-gray-100 rounded-lg flex items-center justify-between" },
            React.createElement("div", { className: "form-control" },
                React.createElement("label", { className: "cursor-pointer label" },
                    React.createElement("span", { className: "label-text font-semibold text-gray-700 mr-2" }, "🧠 Mode Cerdas (Hasil Lebih Mendalam)"), 
                    React.createElement("input", { type: "checkbox", name: "use_thinking_mode", checked: !!formData.use_thinking_mode, onChange: handleChange, className: "toggle toggle-primary" })
                )
            ),
            React.createElement("p", { className: "text-xs text-gray-500" }, "Menggunakan model AI yang lebih kuat untuk hasil yang lebih komprehensif. ", React.createElement("br", null), "Proses generate mungkin sedikit lebih lama.")
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
            React.createElement("button", { type: "submit", disabled: isLoading || !textContent.trim(), className: "inline-flex items-center justify-center px-6 py-2 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400" },
                isLoading ? React.createElement(React.Fragment, null, React.createElement(Spinner, null), React.createElement("span", { className: "ml-2" }, "Generating...")) : 'Generate Administrasi & Bank Soal'
            )
        )
      )
    )
  );
};

export default SuperGenerator;
