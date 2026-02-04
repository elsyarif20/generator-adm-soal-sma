
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

const tourSteps = [
  {
    selector: '#app-title',
    title: 'Selamat Datang!',
    content: 'Ikuti tur singkat ini untuk mengenal fitur-fitur utama platform AI Guru Inovatif.',
    position: 'bottom',
  },
  {
    selector: '#tour-step-admin',
    title: 'Generator Administrasi',
    content: 'Gunakan modul ini untuk membuat semua dokumen administrasi guru, seperti ATP, Prota, Promes, dan Modul Ajar, secara otomatis.',
    position: 'bottom',
  },
  {
    selector: '#tour-step-soal',
    title: 'Generator Bank Soal',
    content: 'Buat set soal lengkap, termasuk kisi-kisi, kunci jawaban, dan rubrik penilaian hanya dengan beberapa klik.',
    position: 'bottom',
  },
  {
    selector: '#tour-step-audioLab',
    title: 'Laboratorium AI Kreatif',
    content: 'Jelajahi berbagai alat AI canggih seperti Lab Audio, Studio Gambar, Studio Video, dan Pencarian Cerdas untuk memperkaya materi ajar Anda.',
    position: 'right',
  },
  {
    selector: '#tour-step-ebook',
    title: 'Sumber Belajar Digital',
    content: 'Akses langsung ribuan sumber belajar digital resmi dari Kemendikbud, Kemenag, dan Perpusnas untuk referensi Anda.',
    position: 'top',
  },
  {
    selector: '#history-list',
    title: 'Riwayat & Aktivitas',
    content: 'Semua perangkat yang Anda generate akan tersimpan di sini. Anda juga dapat melihat aktivitas terkini dari semua pengguna.',
    position: 'top',
  },
];

const OnboardingTour = ({ isOpen, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState({});
  
  const currentStep = tourSteps[stepIndex];

  const updateTargetElement = useCallback(() => {
    if (!isOpen || !currentStep) return;
    const element = document.querySelector(currentStep.selector);
    
    document.querySelectorAll('.tour-spotlight').forEach(el => el.classList.remove('tour-spotlight'));

    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        element.classList.add('tour-spotlight');
        const rect = element.getBoundingClientRect();
        
        let style = {};
        const popoverMargin = 15;

        switch (currentStep.position) {
            case 'top':
                style = { top: rect.top - popoverMargin, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' };
                break;
            case 'right':
                style = { top: rect.top + rect.height / 2, left: rect.right + popoverMargin, transform: 'translateY(-50%)' };
                break;
            case 'left':
                style = { top: rect.top + rect.height / 2, left: rect.left - popoverMargin, transform: 'translate(-100%, -50%)' };
                break;
            default: // bottom
                style = { top: rect.bottom + popoverMargin, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
        }
        setPopoverStyle(style);
    } else {
        setPopoverStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen && currentStep) {
        setTimeout(() => {
            updateTargetElement();
        }, 100);
    }

    window.addEventListener('resize', updateTargetElement);
    return () => {
        window.removeEventListener('resize', updateTargetElement);
    };
  }, [stepIndex, isOpen, currentStep, updateTargetElement]);
  
  const handleComplete = useCallback(() => {
    document.querySelectorAll('.tour-spotlight').forEach(el => el.classList.remove('tour-spotlight'));
    onComplete();
  }, [onComplete]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  if (!isOpen) {
    return null;
  }

  const TourContent = () => (
    React.createElement(React.Fragment, null,
      React.createElement("div", { className: "tour-overlay", onClick: handleComplete }),
      React.createElement("div", { className: "tour-popover fade-in", style: popoverStyle },
        React.createElement("h3", { className: "text-lg font-bold text-gray-900 mb-2" }, currentStep.title),
        React.createElement("p", { className: "text-sm text-gray-600 mb-4" }, currentStep.content),
        React.createElement("div", { className: "flex items-center justify-between" },
          React.createElement("span", { className: "text-xs font-bold text-gray-500" },
            `${stepIndex + 1} / ${tourSteps.length}`
          ),
          React.createElement("div", { className: "space-x-2" },
            stepIndex > 0 && (
              React.createElement("button", { onClick: handlePrev, className: "text-sm font-medium text-gray-600 hover:text-gray-900" },
                "Kembali"
              )
            ),
            React.createElement("button", { onClick: handleNext, className: "text-sm font-medium px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" },
              stepIndex === tourSteps.length - 1 ? 'Selesai' : 'Lanjut'
            )
          )
        )
      )
    )
  );

  return ReactDOM.createPortal(React.createElement(TourContent, null), document.body);
};

export default OnboardingTour;
