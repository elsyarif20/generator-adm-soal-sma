
import React, { useState, useRef } from 'react';

const EditableSection = ({ section, onUpdate, onDelete, onDownload, isArabic }) => {
  const handleContentBlur = (e) => {
    onUpdate(section.id, e.currentTarget.innerHTML);
  };

  return (
    React.createElement("div", { id: `section-${section.id}`, className: "mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow" },
      React.createElement("div", { className: "flex justify-between items-center mb-4 pb-3 border-b border-gray-100" },
        React.createElement("h3", { className: "text-lg font-bold text-indigo-900" }, section.title),
        React.createElement("div", { className: "flex space-x-3" },
          React.createElement("button", {
            onClick: () => onDownload(section),
            className: "text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center",
            title: "Download bagian ini saja"
          },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" })
            ),
            "Download"
          ),
          React.createElement("button", {
            onClick: () => onDelete(section.id),
            className: "text-red-500 hover:text-red-700 font-medium text-sm",
          },
            "Hapus"
          )
        )
      ),
      React.createElement("div", {
        contentEditable: "true",
        onBlur: handleContentBlur,
        dangerouslySetInnerHTML: { __html: section.content },
        className: `results-content-area prose max-w-none prose-sm sm:prose-base focus:outline-none focus:ring-2 focus:ring-indigo-100 p-4 rounded-lg border border-transparent hover:border-gray-100 transition-colors ${isArabic ? 'text-right' : ''}`,
        style: isArabic ? { direction: 'rtl', fontFamily: "'Traditional Arabic', serif" } : {}
      })
    )
  );
};

const ResultsDisplay = ({
  module,
  sections,
  formData,
  onUpdateSectionContent,
  onDeleteSection,
  onNewGeneration,
  onBack,
  onSaveSession,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const getDocumentTitle = (subtitle = "") => {
    const moduleTitles = {
      admin: "Administrasi_Guru",
      soal: "Bank_Soal",
      tryout: "Try_Out_UAS",
      super: "Dokumen_Terpadu"
    };
    const base = `${moduleTitles[module] || 'Dokumen'}_${formData.mata_pelajaran}`;
    return subtitle ? `${base}_${subtitle}` : base;
  };

  const getCommonStyles = (isArabic) => `
    @page {
      margin: 1.0in 0.75in;
      mso-header-margin: .5in;
      mso-footer-margin: .5in;
      mso-paper-source: 0;
    }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      line-height: 1.0; 
      color: #000; 
      margin: 0;
      padding: 0;
      font-size: 11pt;
      mso-line-height-rule: exactly;
    }
    
    /* RESET TOTAL UNTUK MS WORD */
    p, li, div, h1, h2, h3, table, span {
      margin: 0pt !important;
      padding: 0pt !important;
      mso-margin-top-alt: 0pt !important;
      mso-margin-bottom-alt: 0pt !important;
      line-height: 1.15;
    }

    /* KOP SURAT */
    .header { text-align: center; border-bottom: 2.25pt double #000; margin-bottom: 10pt; padding-bottom: 5pt; }
    .header p { font-size: 11pt; }
    .header h1 { font-size: 15pt; font-weight: bold; text-transform: uppercase; }
    
    /* IDENTITAS */
    .info-table { width: 100%; margin-bottom: 12pt; border: none; border-collapse: collapse; }
    .info-table td { border: none; padding: 1pt 4pt; font-size: 11pt; vertical-align: top; }
    .info-label { width: 100pt; font-weight: bold; }
    .info-separator { width: 8pt; text-align: center; }

    /* JUDUL BAGIAN */
    h2.section-title { 
      font-size: 11pt; 
      border-bottom: 0.5pt solid #000; 
      padding-bottom: 1pt; 
      margin-top: 12pt; 
      margin-bottom: 6pt; 
      font-weight: bold; 
      page-break-after: avoid; 
    }
    
    /* TABEL */
    table { border-collapse: collapse; width: 100%; margin: 5pt 0; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    th, td { border: 0.5pt solid #000; padding: 3pt; text-align: left; vertical-align: top; font-size: 10pt; }
    th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
    
    /* LIST NOMOR SOAL */
    ol { margin: 0pt 0pt 0pt 20pt; padding: 0; } 
    ol li { margin-bottom: 8pt !important; padding: 0; mso-list: l0 level1 lfo1; }
    
    /* PILIHAN JAWABAN A-E */
    ol.choices, ol[type="A"] { 
      margin: 2pt 0pt 4pt 15pt !important; 
      padding: 0;
      list-style-type: upper-alpha;
      mso-list: l1 level1 lfo2;
    }
    ol.choices li, ol[type="A"] li { 
      margin-bottom: 1pt !important; 
      mso-margin-bottom-alt: 1pt !important;
    }

    /* PAGE BREAK */
    .forced-page-break { page-break-before: always; }

    ${isArabic ? `
      body, table, div, ol { direction: rtl; text-align: right; }
      .info-label { text-align: right; }
      th, td { text-align: right; }
      ol { padding-right: 25pt; padding-left: 0; }
      ol.choices, ol[type="A"] { padding-right: 18pt; padding-left: 0; }
      .arabic-text { font-family: 'Traditional Arabic', serif; font-size: 16pt; }
    ` : ''}
  `;

  const generateFullHtml = (targetSections = sections) => {
    const isArabic = formData.bahasa === 'Bahasa Arab';
    const headerHtml = `
      <div class="header">
        <p>${formData.yayasan || 'YPI PONDOK MODERN AL-GHOZALI'}</p>
        <h1>${formData.sekolah || 'SMA ISLAM AL-GHOZALI'}</h1>
        <p style="font-size: 8.5pt;">${formData.alamat_sekolah || 'Jl. Permata No. 19 Curug Gunungsindur Kab. Bogor 16340'}</p>
      </div>
      <table class="info-table">
        <tr><td class="info-label">Mata Pelajaran</td><td class="info-separator">:</td><td>${formData.mata_pelajaran}</td></tr>
        <tr><td class="info-label">Kelas / Fase</td><td class="info-separator">:</td><td>${formData.kelas} / ${formData.fase || ''}</td></tr>
        <tr><td class="info-label">Guru Pengampu</td><td class="info-separator">:</td><td>${formData.nama_guru}</td></tr>
        <tr><td class="info-label">Jenis Asesmen</td><td class="info-separator">:</td><td>${formData.kategori_ujian || 'PSAJ'}</td></tr>
        <tr><td class="info-label">Tahun Ajaran</td><td class="info-separator">:</td><td>${formData.tahun_ajaran}</td></tr>
      </table>
    `;

    const contentHtml = targetSections.map((section) => {
      const isForcedBreak = section.title.toLowerCase().includes('kunci') || 
                            section.title.toLowerCase().includes('analisis');
      
      return `
        <div class="${isForcedBreak ? 'forced-page-break' : ''}">
          <h2 class="section-title">${section.title}</h2>
          <div class="${isArabic ? 'arabic-text' : ''}">${section.content}</div>
        </div>
      `;
    }).join('');

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>${getCommonStyles(isArabic)}</style>
      </head>
      <body>
        <div class="container">
          ${headerHtml}
          ${contentHtml}
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadSingle = (section) => {
    const htmlContent = generateFullHtml([section]);
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${section.title.replace(/ /g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(generateFullHtml());
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };
  };
  
  const handleExportDoc = () => {
    const htmlContent = generateFullHtml();
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getDocumentTitle().replace(/ /g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isArabic = formData.bahasa === 'Bahasa Arab';

  return (
    React.createElement("div", { className: "fade-in max-w-5xl mx-auto" },
      React.createElement("div", { className: "mb-8 flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100" },
        React.createElement("div", null,
            React.createElement("button", { onClick: onBack, className: "text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center mb-1 group" }, 
              React.createElement("span", { className: "mr-1 transform group-hover:-translate-x-1 transition-transform" }, "←"), "KEMBALI KE DASHBOARD"
            ),
            React.createElement("h2", { className: "text-2xl font-black text-gray-900 tracking-tight" }, getDocumentTitle().replace(/_/g, ' '))
        ),
        React.createElement("div", { className: "flex items-center space-x-3" },
          React.createElement("button", { onClick: onSaveSession, className: "px-5 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors" }, "Simpan Sesi"),
          React.createElement("div", { className: "relative" },
            React.createElement("button", { 
              onClick: () => setIsExportMenuOpen(!isExportMenuOpen), 
              className: "px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center" 
            }, 
              "Export Semua",
              React.createElement("span", { className: "ml-2" }, isExportMenuOpen ? "▲" : "▼")
            ),
            isExportMenuOpen && (
              React.createElement("div", { className: "absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-30 border border-gray-100 overflow-hidden py-1" },
                React.createElement("button", { onClick: handlePrint, className: "block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors" }, "📄 Cetak / PDF (Lengkap)"),
                React.createElement("button", { onClick: handleExportDoc, className: "block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-t border-gray-50" }, "📝 Download Ms. Word (Lengkap)")
              )
            )
          )
        )
      ),
      React.createElement("div", { className: isArabic ? 'arabic-font-preview' : '' },
        sections.map(section => (
          React.createElement(EditableSection, {
            key: section.id,
            section: section,
            onUpdate: onUpdateSectionContent,
            onDelete: onDeleteSection,
            onDownload: handleDownloadSingle,
            isArabic: isArabic
          })
        ))
      ),
      React.createElement("div", { className: "mt-8 flex justify-center pb-12" },
        React.createElement("button", { onClick: onNewGeneration, className: "px-8 py-3 text-base font-bold text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all" }, "Buat Perangkat Baru Lainnya")
      )
    )
  );
};

export default ResultsDisplay;
