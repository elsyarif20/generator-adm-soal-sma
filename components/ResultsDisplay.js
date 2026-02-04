
import React, { useState, useRef } from 'react';

const EditableSection = ({ section, onUpdate, onDelete, isArabic }) => {
  const handleContentBlur = (e) => {
    onUpdate(section.id, e.currentTarget.innerHTML);
  };

  return (
    React.createElement("div", { id: `section-${section.id}`, className: "mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200" },
      React.createElement("div", { className: "flex justify-between items-center mb-4" },
        React.createElement("h3", { className: "text-xl font-bold text-gray-800" }, section.title),
        React.createElement("button", {
          onClick: () => onDelete(section.id),
          className: "text-red-500 hover:text-red-700 font-semibold text-sm",
          "aria-label": `Hapus bagian ${section.title}`
        },
          "Hapus"
        )
      ),
      React.createElement("div", {
        contentEditable: "true",
        onBlur: handleContentBlur,
        dangerouslySetInnerHTML: { __html: section.content },
        className: `prose max-w-none prose-sm sm:prose-base focus:outline-none focus:ring-2 focus:ring-indigo-400 p-4 rounded-md border border-gray-300 bg-white ${isArabic ? 'text-right' : ''}`,
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
  const resultsRef = useRef(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const getDocumentTitle = () => {
    const moduleTitles = {
        admin: "Dokumen Administrasi Guru",
        soal: "Bank Soal",
        tryout: "Soal Try Out",
        super: "Dokumen Terpusat"
    };
    return `${moduleTitles[module] || 'Dokumen'} - ${formData.mata_pelajaran} Kelas ${formData.kelas}`;
  };

  const generateHtmlContent = (forExport = true) => {
    const title = getDocumentTitle();
    const styles = `
      body { font-family: 'Times New Roman', serif; line-height: 1.5; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      h1, h2, h3 { page-break-after: avoid; }
      .page-break { page-break-before: always; }
      ${formData.bahasa === 'Bahasa Arab' ? `body, table { direction: rtl; text-align: right; }` : ''}
    `;
    const headerHtml = `
      <h1>${title}</h1>
      <p><strong>Mata Pelajaran:</strong> ${formData.mata_pelajaran}</p>
      <p><strong>Kelas/Fase:</strong> ${formData.kelas} / ${formData.fase || ''}</p>
      <p><strong>Nama Guru:</strong> ${formData.nama_guru}</p>
      <p><strong>Sekolah:</strong> ${formData.sekolah}</p>
      <hr/>
    `;

    const contentHtml = sections.map(section => `
      <div class="page-break">
        <h2>${section.title}</h2>
        <div>${section.content}</div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${forExport ? headerHtml : ''}
        ${contentHtml}
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateHtmlContent());
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
  };
  
  const handleExportDoc = () => {
    const htmlContent = generateHtmlContent();
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getDocumentTitle().replace(/ /g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportTxt = () => {
    const tempDiv = document.createElement('div');
    const textContent = sections.map(section => {
        tempDiv.innerHTML = section.content;
        return `${section.title}\n\n${tempDiv.textContent || tempDiv.innerText || ''}\n\n---\n\n`;
    }).join('');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getDocumentTitle().replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isArabic = formData.bahasa === 'Bahasa Arab';

  return (
    React.createElement("div", { className: "fade-in" },
      React.createElement("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-4" },
        React.createElement("div", null,
            React.createElement("button", { onClick: onBack, className: "text-blue-600 hover:text-blue-800 text-sm font-medium mb-2" }, "← Kembali"),
            React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, getDocumentTitle())
        ),
        React.createElement("div", { className: "flex items-center space-x-2" },
          React.createElement("button", { onClick: onNewGeneration, className: "px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700" }, "Buat Baru"),
          React.createElement("button", { onClick: onSaveSession, className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700" }, "Simpan Sesi"),
          React.createElement("div", { className: "relative" },
            React.createElement("button", { onClick: () => setIsExportMenuOpen(!isExportMenuOpen), className: "px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700" }, "Export"),
            isExportMenuOpen && (
              React.createElement("div", { className: "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10" },
                React.createElement("button", { onClick: handlePrint, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" }, "Cetak/PDF"),
                React.createElement("button", { onClick: handleExportDoc, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" }, "Export ke DOC"),
                React.createElement("button", { onClick: handleExportTxt, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" }, "Export ke TXT")
              )
            )
          )
        )
      ),
      React.createElement("div", { ref: resultsRef, className: isArabic ? 'arabic-font-preview' : '' },
        sections.map(section => (
          React.createElement(EditableSection, {
            key: section.id,
            section: section,
            onUpdate: onUpdateSectionContent,
            onDelete: onDeleteSection,
            isArabic: isArabic
          })
        ))
      )
    )
  );
};

export default ResultsDisplay;
