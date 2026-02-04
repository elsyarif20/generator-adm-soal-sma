
export type View = 'dashboard' | 'form' | 'results' | 'groundedSearch';
export type Module = 'admin' | 'soal' | 'tryout' | 'super';
export type NotificationType = 'success' | 'error' | 'warning';

export interface GeneratedSection {
  id: string;
  title: string;
  content: string;
}

export interface SoalPesantrenSection {
  id: string;
  letter: string;
  instruction: string;
  count: number;
}

export interface FormData {
  // Common fields
  jenjang: string;
  kelas: string;
  semester: string;

  mata_pelajaran: string;
  sekolah: string;
  tahun_ajaran: string;
  nama_guru: string;
  
  // Admin module specific
  fase?: string;
  cp_elements?: string;
  alokasi_waktu?: string;
  jumlah_modul_ajar?: number;

  // Soal module specific
  kategori_ujian?: 'TO' | 'PTS' | 'UAS'; // NEW FIELD
  sertakan_soal_tka?: boolean;
  jumlah_soal_tka?: number;
  sertakan_soal_tka_uraian?: boolean;
  jumlah_soal_tka_uraian?: number;
  kelompok_tka?: 'saintek' | 'soshum';
  sertakan_kisi_kisi?: boolean;
  topik_materi?: string;
  jenis_soal?: string[];
  jumlah_pg?: number;
  jumlah_uraian?: number;
  jumlah_isian_singkat?: number;
  tingkat_kesulitan?: string;
  bahasa?: string;

  // Pesantren-specific soal fields (NEW DYNAMIC STRUCTURE)
  soal_pesantren_sections?: SoalPesantrenSection[];
  
  // Soal module header customization
  yayasan?: string;
  alamat_sekolah?: string;
  logo_sekolah?: string; // base64 string
  judul_asesmen?: string;
  tanggal_ujian?: string;
  jam_ke?: string;
  waktu_ujian?: string;

  // AI Power-up
  use_thinking_mode?: boolean;
}

export interface HistoryItem extends FormData {
  id: string;
  module_type: Module;
  generated_sections: GeneratedSection[];
  created_at: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
    [key: string]: any;
}

export interface ActivityLogItem {
  id:string;
  user: string;
  module_type: Module;
  details: string;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  user: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ShareableLink {
  id: string;
  userName: string;
  url: string;
  usageCount: number;
  createdAt: string;
}
