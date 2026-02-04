
import React from 'react';
import { Module, View } from '../types';

interface DashboardProps {
  onModuleSelect: (module: Module | View) => void;
}

const modules = [
  {
    id: 'admin',
    title: 'Generator Administrasi Guru',
    description: 'ATP, Prota, Promes, Modul Ajar, KKTP, & Jurnal Harian.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    ),
    color: 'blue',
  },
  {
    id: 'soal',
    title: 'Generator Bank Soal',
    description: 'Bank soal adaptif, kisi-kisi, & rubrik penilaian.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
      </svg>
    ),
    color: 'green',
  },
  {
    id: 'tryout',
    title: 'Generator Soal Try Out & UAS',
    description: 'Latihan ujian akhir Kelas 12 & Bank Soal TKA Akademik.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
      </svg>
    ),
    color: 'orange',
  },
  {
    id: 'super',
    title: 'Generator Terpusat (Admin & Soal)',
    description: 'Generate ATP, Modul Ajar, & Bank Soal dari teks buku ajar.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l.407 8.14a1 1 0 00.95.95l8.14.407a1 1 0 01.95.897 1 1 0 01-.95.897l-8.14.407a1 1 0 00-.95.95l-.407 8.14a1 1 0 01-.897.95 1 1 0 01-.897-.95l-.407-8.14a1 1 0 00-.95-.95l-8.14-.407a1 1 0 01-.95-.897 1 1 0 01.95-.897l8.14-.407a1 1 0 00.95-.95l.407-8.14a1 1 0 01.897-.95z" clipRule="evenodd" /></svg>
    ),
    color: 'purple',
  },
  {
    id: 'groundedSearch',
    title: 'Pencarian Cerdas',
    description: 'Dapatkan jawaban akurat dari web & peta terkini.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
    ),
    color: 'pink',
  },
  {
    id: 'ebook',
    title: 'Perpustakaan Digital',
    description: 'Akses ribuan buku digital resmi dari Kemendikbud.',
    color: 'orange',
    url: 'https://buku.kemendikdasmen.go.id/',
  },
  {
    id: 'quran',
    title: "Al-Qur'an Digital",
    description: "Akses Al-Qur'an digital lengkap dari Kemenag.",
    color: 'indigo',
    url: 'https://quran.kemenag.go.id/',
  },
  {
    id: 'hadits',
    title: "Hadits Digital",
    description: "Akses koleksi hadits lengkap dari Hadits.id.",
    color: 'cyan',
    url: 'https://www.hadits.id/',
  },
  {
    id: 'perpusnas',
    title: 'Perpustakaan Nasional',
    description: 'Jelajahi koleksi buku baru dari Perpusnas RI.',
    color: 'gray',
    url: 'https://www.perpusnas.go.id/buku-baru',
  }
];

const colorClasses = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-200', hoverBg: 'hover:bg-blue-50', hoverBorder: 'hover:border-blue-500' },
    green: { bg: 'bg-green-500', border: 'border-green-200', hoverBg: 'hover:bg-green-50', hoverBorder: 'hover:border-green-500' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-200', hoverBg: 'hover:bg-orange-50', hoverBorder: 'hover:border-orange-500' },
    pink: { bg: 'bg-pink-500', border: 'border-pink-200', hoverBg: 'hover:bg-pink-50', hoverBorder: 'hover:border-pink-500' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-200', hoverBg: 'hover:bg-purple-50', hoverBorder: 'hover:border-purple-500' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-200', hoverBg: 'hover:bg-indigo-50', hoverBorder: 'hover:border-indigo-500' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-200', hoverBg: 'hover:bg-cyan-50', hoverBorder: 'hover:border-cyan-500' },
    gray: { bg: 'bg-gray-500', border: 'border-gray-200', hoverBg: 'hover:bg-gray-50', hoverBorder: 'hover:border-gray-500' }
}

const BookmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
);

const Dashboard: React.FC<DashboardProps> = ({ onModuleSelect }) => {
  const generatorModules = modules.filter(m => !('url' in m));
  const externalLinks = modules.filter(m => 'url' in m);

  return (
    <div className="fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Toolkit AI Guru Inovatif</h2>
        <p className="mt-2 text-xl font-semibold text-gray-800">LPMP YPI Pondok Modern Al-Ghozali</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatorModules.map((mod: any) => {
          const colors = colorClasses[mod.color as keyof typeof colorClasses];
          return (
            <button
              key={mod.id}
              onClick={() => onModuleSelect(mod.id as any)}
              className={`p-6 border-2 ${colors.border} rounded-lg ${colors.hoverBorder} ${colors.hoverBg} transition-all text-left flex flex-col items-start card-shadow`}
            >
              <div className="flex items-center mb-3 w-full">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mr-4`}>
                  {mod.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{mod.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{mod.description}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-16">
        <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Sumber Belajar Digital</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {externalLinks.map(link => {
                const colors = colorClasses[link.color as keyof typeof colorClasses];
                return (
                    <a
                        href={link.url}
                        target={link.url === '#' ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        key={link.id}
                        className={`group flex items-center p-4 border-2 rounded-lg transition-all card-shadow ${colors.border} ${colors.hoverBorder} ${colors.hoverBg}`}
                    >
                        <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mr-4`}>
                            <BookmarkIcon />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-semibold text-gray-800 text-sm">{link.title}</h4>
                            <p className="text-xs text-gray-500">{link.description}</p>
                        </div>
                        <div className="ml-4 text-gray-400 group-hover:text-gray-600">
                            <ExternalLinkIcon />
                        </div>
                    </a>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
