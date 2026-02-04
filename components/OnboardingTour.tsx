import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
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

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState({});
  
  const currentStep = tourSteps[stepIndex];

  const updateTargetElement = useCallback(() => {
    if (!isOpen || !currentStep) return;
    const element = document.querySelector(currentStep.selector) as HTMLElement;
    
    document.querySelectorAll('.tour-spotlight').forEach(el => el.classList.remove('tour-spotlight'));

    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        element.classList.add('tour-spotlight');
        const rect = element.getBoundingClientRect();
        
        let style: React.CSSProperties = {};
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
    <>
      <div className="tour-overlay" onClick={handleComplete}></div>
      <div className="tour-popover fade-in" style={popoverStyle}>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{currentStep.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{currentStep.content}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">
            {stepIndex + 1} / {tourSteps.length}
          </span>
          <div className="space-x-2">
            {stepIndex > 0 && (
              <button onClick={handlePrev} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Kembali
              </button>
            )}
            <button onClick={handleNext} className="text-sm font-medium px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              {stepIndex === tourSteps.length - 1 ? 'Selesai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(<TourContent />, document.body);
};

export default OnboardingTour;