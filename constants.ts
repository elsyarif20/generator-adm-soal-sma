
export const KELAS_OPTIONS: Record<string, string[]> = {
    'SMA': ['10', '11', '12']
};

const islamicAndLanguageSubjects = [
    'PAI dan Budi Pekerti', 'Bahasa Sunda', 'Bahasa Arab', 'Grammar', 'Nahwu',
    'Sharaf', 'Ulumul Quran', 'Ushul Fiqh', 'Tarbiyah', 'Insya', 'Hadits',
    'Mushtolahul Hadits', 'Fiqih', 'Tarikh Islam'
];

// Consolidate all subjects that should be treated as Arabic context into one list.
const allArabicRelatedSubjects = [
    'Bahasa Arab', 'Nahwu', 'Sharaf', 'Shorof', 'Tarbiyah', 'Insya', 'Hadits',
    'Mushtolahul Hadits', 'Fiqih', 'Tarikh Islam', 'Balaghah', 'Imla',
    'Khot', 'Khot Imla', 'Muthola\'ah', 'Muthalaah', 'Tamrin Lughoh', 
    'Tamrin Lughah', 'Tafsir', 'Ulumul Qur\'an', 'Ushul Fiqh'
];

const fullArabicSubjects = [...new Set(allArabicRelatedSubjects.map(s => s.toUpperCase().replace(/'|\\/g, '')))];

export const ARABIC_SUBJECTS = [
    ...new Set([
        'PAI DAN BUDI PEKERTI',
        ...fullArabicSubjects
    ])
];

// Subjects considered as exact sciences for question count logic
export const EKSAK_SUBJECTS = ['MATEMATIKA', 'MATEMATIKA TINGKAT LANJUT', 'IPA', 'FISIKA', 'KIMIA', 'BIOLOGI', 'INFORMATIKA', 'KODING DAN KECERDASAN ARTIFISIAL (KKA)'];

const smaSubjects = ['Bahasa Indonesia', 'Matematika', 'Matematika Tingkat Lanjut', 'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Geografi', 'Sejarah', 'Sosiologi', 'PPKn', 'Bahasa Inggris', 'Informatika', 'Koding dan Kecerdasan Artifisial (KKA)', 'PJOK', 'Seni Budaya', 'Prakarya'];

export const MATA_PELAJARAN_OPTIONS: Record<string, string[]> = {
    'SMA': [...new Set([...smaSubjects, ...islamicAndLanguageSubjects])]
};

export const ALOKASI_WAKTU_OPTIONS: Record<string, string[]> = {
    'SMA': ['2 JP/minggu (90 menit/minggu)', '3 JP/minggu (135 menit/minggu)', '4 JP/minggu (180 menit/minggu)']
};

export const PESANTREN_SOAL_LETTERS = ['Alif', 'Ba', 'Jim', 'Dal', 'Ha', 'Waw', 'Zay'];
export const PESANTREN_SOAL_LETTERS_LATIN = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const TEACHER_NAMES = [
    "Adam Hafidz, S.M",
    "Ahmad Fahrudin",
    "Ahmad Firdaus, S.Ag",
    "Ahmad Jaenilma, S.Kom",
    "Antoni Firdaus, M.Pd",
    "Doni Subiyanto, SE",
    "Edi Sanjaya, S.Pd",
    "Fadhilah, S.Pd",
    "Fadilah Abidana, M.Pd",
    "H. Asep Saepudin, M.Pd",
    "Hafidz Hidayat, S.Pd",
    "Hj. Barrirotul Choiriyah, SEI",
    "Ir. Rahmawati, M.Pd",
    "Khairil Fahmi, S.Pd",
    "Liyas Syarifudin, M.Pd",
    "Lulu Zahrotunnisa, S.Pd",
    "M. Alief Nugraha Afta",
    "M. Hidayatu Rusdy, SH",
    "Mali, S.Pd",
    "Muhammad Rahul Sayyid",
    "Muhammad Suhail, S.Pd",
    "Mursyid Anwar, M.Pd",
    "Muslich Anwar, M.Pd",
    "Namin, S.Pd.I",
    "Nurachman, M.Pd",
    "Nurlaila, S.Ag",
    "Padlin, M.Pd",
    "Putri Dina Oktavia, S.Pd",
    "Rendi Ramadhan, S.Pd",
    "Rizki Karomah, S.Pd",
    "Rizki Karomah, S.Si",
    "Sadam Hamzah, SHI",
    "Saleha Mufida, M.Han",
    "Siti Nurzulfiyah, S.Pd",
    "Subhan, S.Pd",
    "Syahroni",
    "Toni, S.Go",
    "Wintarsa, S.Pd.I",
    "Zaini Fikri, S.Pd,I"
].sort();
