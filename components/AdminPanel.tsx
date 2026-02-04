import React, { useState } from 'react';
import { ShareableLink } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  links: ShareableLink[];
  onAddLink: (userName: string) => void;
  onDeleteLink: (id: string) => void;
  onBackupData: () => void;
  onRestoreData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTeachers: (teachers: string[]) => void;
}

type AdminTab = 'performanceReport' | 'tracking' | 'dataManagement';

const reportHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Kinerja Guru 2025/2026</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      box-sizing: border-box;
      background: #eef2f6; 
      font-family: 'Segoe UI', Arial, sans-serif; 
      margin: 0;
      height: 100%;
    }
    html { height: 100%; }
    .wrap { 
      max-width: 750px; 
      background: #fff; 
      margin: 42px auto; 
      border-radius:18px; 
      box-shadow:0 8px 32px #aaadbbc9; 
      padding:32px 28px; 
    }
    .kop { 
      border-bottom: 3px solid #345; 
      text-align: center; 
      padding-bottom: 10px; 
      margin-bottom: 12px;
    }
    .kop1 { font-size: 1.09em; font-weight:600;}
    .kop2 { font-size: 1.1em; font-weight:700; margin-top: 2px;}
    .judul {font-size:1.18em; font-weight:bold; margin-top:7px; }
    .data-guru { margin-top:20px; margin-bottom: 4px;}
    .data-guru td { padding:5px 11px 2px 2px; border:none;}
    label {font-weight:600; margin-right: 7px;}
    select, input[type="text"], input[type="number"] {
      padding: 5px 7px; 
      font-size: 1em;
      border:1.1px solid #ccc; 
      border-radius: 4px; 
      background:#f6f9ff;
      margin-top: 2px; 
      margin-bottom: 2px;
    }
    table.tabel-nilai {
      width:100%; 
      border-collapse: collapse; 
      margin-top:16px; 
      margin-bottom:12px;
    }
    table.tabel-nilai th, table.tabel-nilai td {
      border: 2px solid #222; 
      padding:8px 6px; 
      text-align:center; 
      font-size:1em;
    }
    table.tabel-nilai th {
      background: #e7eefa; 
      font-weight: 700;
    }
    table.tabel-nilai tr:last-child td {
      font-weight:700; 
      background:#f8f8fb;
      border-top: 3.7px double #222;
    }
    .footer {margin-top:30px;}
    .ttd-row {
      display:flex; 
      justify-content:space-between; 
      align-items:flex-start; 
      margin-top:30px; 
      padding:0 25px;
    }
    .ttd-block {text-align:center; min-width: 200px;}
    .ttd-space { height: 80px; }
    .export-btn {
      background:#254c8d; 
      color:#fff; 
      padding:9px 26px; 
      border:none; 
      border-radius:6px; 
      font-weight:600; 
      font-size:1em; 
      margin:18px auto 0;
      display:block; 
      cursor:pointer;
    }
    .export-btn:hover { background: #3d7be7; }
    .tindak {font-size:0.98em; padding: 6px 0;}
    .field-wrap { display:inline-block; min-width: 80px;}
    .nInput { width: 60px; }
    .catatan-section {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    .catatan-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .catatan-section textarea {
      width: 100%;
      min-height: 80px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: inherit;
      resize: vertical;
    }
    @media (max-width:700px){
      .wrap{padding:12px 1vw}
      .ttd-row { flex-direction: column; gap: 30px; }
    }
  </style>
</head>
<body>
<div class="wrap">
  <div class="kop">
    <div class="kop1">YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI<br>UNIT SMP DAN SMA ISLAM AL-GHOZALI</div>
    <div class="judul">Laporan Kinerja Guru 2025/2026</div>
  </div>
  
  <form id="raportForm" autocomplete="off">
    <table class="data-guru">
      <tr>
        <td><label for="nama">Nama Guru</label></td>
        <td><input type="text" id="nama" required></td>
        <td><label for="nik">NIK/NUPTK</label></td>
        <td><input type="text" id="nik" style="width:150px;"></td>
      </tr>
      <tr>
        <td><label for="jabatan">Jabatan</label></td>
        <td><input type="text" id="jabatan" placeholder="Guru Mapel"></td>
        <td><label for="unit">Unit</label></td>
        <td>
          <select id="unit">
            <option>SMP ISLAM AL-GHOZALI</option>
            <option>SMA ISLAM AL-GHOZALI</option>
          </select>
        </td>
      </tr>
    </table>
    
    <table class="tabel-nilai">
      <tr>
        <th rowspan="2">No</th>
        <th rowspan="2">Komponen<br>Penilaian</th>
        <th rowspan="2">Skor Minimum</th>
        <th colspan="2">Nilai</th>
        <th rowspan="2">Predikat</th>
      </tr>
      <tr>
        <th>Angka</th>
        <th>Huruf</th>
      </tr>
      <tr>
        <td>1</td>
        <td>Pedagogik</td>
        <td>70</td>
        <td><input type="number" class="nInput" id="pedagogik" min="0" max="100" value="70" required></td>
        <td class="huruf" id="pedagogik_huruf">B</td>
        <td id="predikat_pedagogik">Baik</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Profesional</td>
        <td>70</td>
        <td><input type="number" class="nInput" id="profesional" min="0" max="100" value="70" required></td>
        <td class="huruf" id="profesional_huruf">B</td>
        <td id="predikat_profesional">Baik</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Kehadiran</td>
        <td>80</td>
        <td><input type="number" class="nInput" id="kehadiran" min="0" max="100" value="80" required></td>
        <td class="huruf" id="kehadiran_huruf">B</td>
        <td id="predikat_kehadiran">Baik</td>
      </tr>
      <tr>
        <td>4</td>
        <td>Sosial</td>
        <td>70</td>
        <td><input type="number" class="nInput" id="sosial" min="0" max="100" value="70" required></td>
        <td class="huruf" id="sosial_huruf">B</td>
        <td id="predikat_sosial">Baik</td>
      </tr>
      <tr>
        <td>5</td>
        <td>Kepribadian</td>
        <td>70</td>
        <td><input type="number" class="nInput" id="kepribadian" min="0" max="100" value="70" required></td>
        <td class="huruf" id="kepribadian_huruf">B</td>
        <td id="predikat_kepribadian">Baik</td>
      </tr>
      <tr>
        <td colspan="3"><strong>RATA-RATA</strong></td>
        <td id="rata_angka"><strong>72</strong></td>
        <td id="rata_huruf"><strong>B</strong></td>
        <td id="rata_predikat"><strong>Baik</strong></td>
      </tr>
    </table>

    <div class="catatan-section">
      <label for="catatan">Catatan dan Rekomendasi:</label>
      <textarea id="catatan" placeholder="Masukkan catatan penilaian dan rekomendasi untuk pengembangan..."></textarea>
    </div>

    <div class="footer">
      <div class="ttd-row">
        <div class="ttd-block">
          <div>Kepala Sekolah</div>
          <div class="ttd-space"></div>
          <div id="namaKepsek">_________________</div>
        </div>
        <div class="ttd-block">
          <div>Tanggal: <span id="tanggal"></span></div>
          <div style="margin-top: 20px;">Penilai</div>
          <div class="ttd-space"></div>
          <div>Nurachman,S.Pd.I,M.Pd.</div>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 18px;">
      <button type="button" class="export-btn" onclick="exportToPDF()">📄 Cetak PDF</button>
      <button type="button" class="export-btn" onclick="exportToWord()">📝 Export Word</button>
      <button type="button" class="export-btn" onclick="exportToPNG()">🖼️ Export PNG</button>
    </div>
  </form>

  <!-- Tombol untuk membuka rekapitulasi -->
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
    <button type="button" class="export-btn" onclick="openRekapitulasi()" style="background: #28a745; font-size: 1.1em; padding: 12px 30px;">
      📊 Rekapitulasi Kinerja Seluruh Karyawan
    </button>
  </div>
</div>

<!-- Modal Rekapitulasi -->
<div id="rekapModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
  <div style="background: white; margin: 2% auto; padding: 20px; width: 95%; max-width: 1200px; border-radius: 10px; max-height: 90%; overflow-y: auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #345; padding-bottom: 10px;">
      <h2 style="margin: 0; color: #345;">📊 Rekapitulasi Kinerja Karyawan 2025/2026</h2>
      <button onclick="closeRekapitulasi()" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 18px;">✕</button>
    </div>
    
    <!-- Form tambah karyawan -->
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0;">➕ Tambah Data Karyawan</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 15px;">
        <input type="text" id="newNama" placeholder="Nama Karyawan" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <input type="text" id="newJabatan" placeholder="Jabatan" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <select id="newUnit" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option>SMP ISLAM AL-GHOZALI</option>
          <option>SMA ISLAM AL-GHOZALI</option>
        </select>
      </div>
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 15px;">
        <input type="number" id="newPedagogik" placeholder="Pedagogik" min="0" max="100" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <input type="number" id="newProfesional" placeholder="Profesional" min="0" max="100" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <input type="number" id="newKehadiran" placeholder="Kehadiran" min="0" max="100" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <input type="number" id="newSosial" placeholder="Sosial" min="0" max="100" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <input type="number" id="newKepribadian" placeholder="Kepribadian" min="0" max="100" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
      <button onclick="tambahKaryawan()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">➕ Tambah Karyawan</button>
    </div>

    <!-- Tabel rekapitulasi -->
    <div style="overflow-x: auto;">
      <table id="rekapTable" style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
        <thead>
          <tr style="background: #345; color: white;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">No</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Nama</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Jabatan</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Unit</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Pedagogik</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Profesional</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Kehadiran</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Sosial</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Kepribadian</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Rata-rata</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Predikat</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Aksi</th>
          </tr>
        </thead>
        <tbody id="rekapTableBody">
          <!-- Data akan diisi oleh JavaScript -->
        </tbody>
      </table>
    </div>

    <!-- Statistik -->
    <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
        <h4 style="margin: 0; color: #1976d2;">Total Karyawan</h4>
        <div id="totalKaryawan" style="font-size: 2em; font-weight: bold; color: #1976d2;">0</div>
      </div>
      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
        <h4 style="margin: 0; color: #388e3c;">Rata-rata Keseluruhan</h4>
        <div id="rataKeseluruhan" style="font-size: 2em; font-weight: bold; color: #388e3c;">0</div>
      </div>
      <div style="background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">
        <h4 style="margin: 0; color: #f57c00;">Perlu Perbaikan</h4>
        <div id="perluPerbaikan" style="font-size: 2em; font-weight: bold; color: #f57c00;">0</div>
      </div>
      <div style="background: #fce4ec; padding: 15px; border-radius: 8px; text-align: center;">
        <h4 style="margin: 0; color: #c2185b;">Kinerja Baik</h4>
        <div id="kinerjaBaik" style="font-size: 2em; font-weight: bold; color: #c2185b;">0</div>
      </div>
    </div>

    <!-- Tombol export rekapitulasi -->
    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button onclick="exportRekapPDF()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">📄 Export PDF</button>
        <button onclick="exportRekapWord()" style="background: #0d6efd; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">📝 Export Word</button>
        <button onclick="exportRekapExcel()" style="background: #198754; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">📊 Export Excel</button>
        <button onclick="exportRekapPNG()" style="background: #6f42c1; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🖼️ Export PNG</button>
      </div>
    </div>
  </div>
</div>

<script>
// Set tanggal hari ini
document.getElementById('tanggal').textContent = new Date().toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'long', 
  year: 'numeric'
});

// Fungsi konversi nilai ke huruf dan predikat
function konversiNilai(nilai) {
  if (nilai >= 90) return { huruf: 'A', predikat: 'Sangat Baik' };
  if (nilai >= 80) return { huruf: 'B+', predikat: 'Baik Sekali' };
  if (nilai >= 70) return { huruf: 'B', predikat: 'Baik' };
  if (nilai >= 60) return { huruf: 'C+', predikat: 'Cukup Baik' };
  if (nilai >= 50) return { huruf: 'C', predikat: 'Cukup' };
  return { huruf: 'D', predikat: 'Kurang' };
}

// Fungsi update nilai
function updateNilai() {
  const komponen = [
    { id: 'pedagogik', nama: 'Pedagogik', minimum: 70 },
    { id: 'profesional', nama: 'Profesional', minimum: 70 },
    { id: 'kehadiran', nama: 'Kehadiran', minimum: 80 },
    { id: 'sosial', nama: 'Sosial', minimum: 70 },
    { id: 'kepribadian', nama: 'Kepribadian', minimum: 70 }
  ];
  
  let totalNilai = 0;
  let jumlahKomponen = 0;
  let komponenKurang = [];
  let komponenBaik = [];

  komponen.forEach(komp => {
    const input = document.getElementById(komp.id);
    const nilai = parseInt(input.value) || 0;
    const konversi = konversiNilai(nilai);
    
    document.getElementById(komp.id + '_huruf').textContent = konversi.huruf;
    document.getElementById('predikat_' + komp.id).textContent = konversi.predikat;
    
    if (nilai > 0) {
      totalNilai += nilai;
      jumlahKomponen++;
      
      // Cek apakah di bawah minimum
      if (nilai < komp.minimum) {
        komponenKurang.push({
          nama: komp.nama,
          nilai: nilai,
          minimum: komp.minimum,
          selisih: komp.minimum - nilai
        });
      } else if (nilai >= 85) {
        komponenBaik.push(komp.nama);
      }
    }
  });

  // Hitung rata-rata
  const rataRata = jumlahKomponen > 0 ? Math.round(totalNilai / jumlahKomponen) : 0;
  const konversiRata = konversiNilai(rataRata);
  
  document.getElementById('rata_angka').innerHTML = '<strong>' + rataRata + '</strong>';
  document.getElementById('rata_huruf').innerHTML = '<strong>' + konversiRata.huruf + '</strong>';
  document.getElementById('rata_predikat').innerHTML = '<strong>' + konversiRata.predikat + '</strong>';
  
  // Generate catatan otomatis
  generateCatatan(komponenKurang, komponenBaik, rataRata);
}

// Fungsi generate catatan otomatis
function generateCatatan(komponenKurang, komponenBaik, rataRata) {
  let catatan = '';
  
  // Penilaian umum berdasarkan rata-rata
  if (rataRata >= 85) {
    catatan += 'PENILAIAN UMUM: Kinerja guru sangat memuaskan dengan rata-rata ' + rataRata + '. ';
  } else if (rataRata >= 75) {
    catatan += 'PENILAIAN UMUM: Kinerja guru baik dengan rata-rata ' + rataRata + '. ';
  } else if (rataRata >= 65) {
    catatan += 'PENILAIAN UMUM: Kinerja guru cukup dengan rata-rata ' + rataRata + '. ';
  } else {
    catatan += 'PENILAIAN UMUM: Kinerja guru perlu perbaikan dengan rata-rata ' + rataRata + '. ';
  }
  
  // Komponen yang baik
  if (komponenBaik.length > 0) {
    catatan += '\\n\\nKEUNGGULAN:\\n';
    komponenBaik.forEach(komp => {
      catatan += '• Aspek ' + komp + ' menunjukkan kinerja yang sangat baik\\n';
    });
  }
  
  // Komponen yang kurang
  if (komponenKurang.length > 0) {
    catatan += '\\n\\nAREA YANG PERLU DIPERBAIKI:\\n';
    komponenKurang.forEach(komp => {
      catatan += '• Aspek ' + komp.nama + ' masih di bawah standar minimum (' + komp.nilai + '/' + komp.minimum + ')\\n';
    });
    
    catatan += '\\n\\nREKOMENDASI PERBAIKAN:\\n';
    komponenKurang.forEach(komp => {
      switch(komp.nama) {
        case 'Pedagogik':
          catatan += '• Mengikuti pelatihan metode pembelajaran dan pengelolaan kelas\\n';
          catatan += '• Meningkatkan kemampuan dalam penyusunan RPP dan evaluasi pembelajaran\\n';
          break;
        case 'Profesional':
          catatan += '• Mengikuti workshop pengembangan kompetensi bidang studi\\n';
          catatan += '• Melakukan penelitian tindakan kelas untuk meningkatkan kualitas mengajar\\n';
          break;
        case 'Kehadiran':
          catatan += '• Meningkatkan disiplin kehadiran dan ketepatan waktu\\n';
          catatan += '• Memberikan pemberitahuan dini jika berhalangan hadir\\n';
          break;
        case 'Sosial':
          catatan += '• Meningkatkan komunikasi dan kerjasama dengan rekan kerja\\n';
          catatan += '• Aktif berpartisipasi dalam kegiatan sekolah dan komunitas\\n';
          break;
        case 'Kepribadian':
          catatan += '• Mengembangkan sikap profesional dan integritas dalam bekerja\\n';
          catatan += '• Meningkatkan kemampuan sebagai teladan bagi siswa\\n';
          break;
      }
    });
    
    catatan += '\\n\\nTARGET PERBAIKAN:\\n';
    catatan += '• Evaluasi ulang dalam 3 bulan ke depan\\n';
    catatan += '• Pendampingan intensif dari supervisor akademik\\n';
  } else {
    catatan += '\\n\\nREKOMENDASI:\\n';
    catatan += '• Pertahankan kinerja yang baik\\n';
    catatan += '• Terus tingkatkan kompetensi melalui pengembangan diri\\n';
    catatan += '• Dapat menjadi mentor bagi guru lain\\n';
  }
  
  document.getElementById('catatan').value = catatan;
}

// Event listeners untuk semua input nilai
document.querySelectorAll('.nInput').forEach(input => {
  input.addEventListener('input', updateNilai);
});

// Event listener untuk unit - update nama kepala sekolah
document.getElementById('unit').addEventListener('change', function() {
  const unit = this.value;
  const namaKepsek = document.getElementById('namaKepsek');
  
  if (unit === 'SMP ISLAM AL-GHOZALI') {
    namaKepsek.textContent = 'Iswahyudin,SE';
  } else if (unit === 'SMA ISLAM AL-GHOZALI') {
    namaKepsek.textContent = 'Antoni Firdaus,SHI,M.Pd.';
  }
});

// Fungsi export PDF individual
function exportToPDF() {
  const nama = document.getElementById('nama').value;
  if (!nama.trim()) {
    showNotification('Mohon isi nama guru terlebih dahulu!', 'warning');
    return;
  }
  
  // Buat konten HTML untuk PDF
  const printContent = document.querySelector('.wrap').cloneNode(true);
  
  // Hapus tombol dari konten yang akan dicetak
  const buttons = printContent.querySelectorAll('button');
  buttons.forEach(btn => btn.remove());
  
  // Buat window baru untuk print
  const printWindow = window.open('', '_blank');
  printWindow.document.write(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Kinerja - \${nama}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; }
        .wrap { max-width: none; box-shadow: none; border: 1px solid #000; }
        table { border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      \${printContent.outerHTML}
    </body>
    </html>
  \`);
  printWindow.document.close();
  printWindow.print();
  
  showNotification('Laporan berhasil dicetak! 📄', 'success');
}

// Fungsi notifikasi custom
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = \`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  \`;
  
  if (type === 'success') {
    notification.style.background = '#28a745';
  } else if (type === 'warning') {
    notification.style.background = '#ffc107';
    notification.style.color = '#000';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// CSS untuk animasi
const style = document.createElement('style');
style.textContent = \`
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
\`;
document.head.appendChild(style);

// Data karyawan (localStorage)
let dataKaryawan = JSON.parse(localStorage.getItem('dataKaryawan')) || [];

// Fungsi untuk membuka modal rekapitulasi
function openRekapitulasi() {
  document.getElementById('rekapModal').style.display = 'block';
  loadRekapitulasi();
}

// Fungsi untuk menutup modal rekapitulasi
function closeRekapitulasi() {
  document.getElementById('rekapModal').style.display = 'none';
}

// Fungsi untuk menambah karyawan baru
function tambahKaryawan() {
  const nama = document.getElementById('newNama').value.trim();
  const jabatan = document.getElementById('newJabatan').value.trim();
  const unit = document.getElementById('newUnit').value;
  const pedagogik = parseInt(document.getElementById('newPedagogik').value) || 0;
  const profesional = parseInt(document.getElementById('newProfesional').value) || 0;
  const kehadiran = parseInt(document.getElementById('newKehadiran').value) || 0;
  const sosial = parseInt(document.getElementById('newSosial').value) || 0;
  const kepribadian = parseInt(document.getElementById('newKepribadian').value) || 0;

  if (!nama || !jabatan) {
    showNotification('Mohon isi nama dan jabatan karyawan!', 'warning');
    return;
  }

  const rataRata = Math.round((pedagogik + profesional + kehadiran + sosial + kepribadian) / 5);
  const predikat = konversiNilai(rataRata).predikat;

  const karyawanBaru = {
    id: Date.now(),
    nama,
    jabatan,
    unit,
    pedagogik,
    profesional,
    kehadiran,
    sosial,
    kepribadian,
    rataRata,
    predikat
  };

  dataKaryawan.push(karyawanBaru);
  localStorage.setItem('dataKaryawan', JSON.stringify(dataKaryawan));
  
  // Reset form
  document.getElementById('newNama').value = '';
  document.getElementById('newJabatan').value = '';
  document.getElementById('newPedagogik').value = '';
  document.getElementById('newProfesional').value = '';
  document.getElementById('newKehadiran').value = '';
  document.getElementById('newSosial').value = '';
  document.getElementById('newKepribadian').value = '';

  loadRekapitulasi();
  showNotification('Karyawan berhasil ditambahkan!', 'success');
}

// Fungsi untuk menghapus karyawan
function hapusKaryawan(id) {
  dataKaryawan = dataKaryawan.filter(k => k.id !== id);
  localStorage.setItem('dataKaryawan', JSON.stringify(dataKaryawan));
  loadRekapitulasi();
  showNotification('Karyawan berhasil dihapus!', 'success');
}

// Fungsi untuk memuat data rekapitulasi
function loadRekapitulasi() {
  const tbody = document.getElementById('rekapTableBody');
  tbody.innerHTML = '';

  let totalRata = 0;
  let kinerjaBaikCount = 0;
  let perluPerbaikanCount = 0;

  dataKaryawan.forEach((karyawan, index) => {
    const row = document.createElement('tr');
    row.style.background = index % 2 === 0 ? '#f8f9fa' : 'white';
    
    // Tentukan warna berdasarkan rata-rata
    let rataColor = '#000';
    if (karyawan.rataRata >= 85) {
      rataColor = '#28a745';
      kinerjaBaikCount++;
    } else if (karyawan.rataRata >= 70) {
      rataColor = '#007bff';
      kinerjaBaikCount++;
    } else {
      rataColor = '#dc3545';
      perluPerbaikanCount++;
    }

    row.innerHTML = \`
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\${index + 1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">\${karyawan.nama}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">\${karyawan.jabatan}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">\${karyawan.unit}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\${karyawan.pedagogik}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\${karyawan.profesional}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\${karyawan.kehadiran}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\${karyawan.sosial}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\${karyawan.kepribadian}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; color: \${rataColor};">\${karyawan.rataRata}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: \${rataColor};">\${karyawan.predikat}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
        <button onclick="hapusKaryawan(\${karyawan.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">🗑️ Hapus</button>
      </td>
    \`;
    tbody.appendChild(row);
    totalRata += karyawan.rataRata;
  });

  // Update statistik
  document.getElementById('totalKaryawan').textContent = dataKaryawan.length;
  document.getElementById('rataKeseluruhan').textContent = dataKaryawan.length > 0 ? Math.round(totalRata / dataKaryawan.length) : 0;
  document.getElementById('perluPerbaikan').textContent = perluPerbaikanCount;
  document.getElementById('kinerjaBaik').textContent = kinerjaBaikCount;
}

// Fungsi export Word individual
function exportToWord() {
  const nama = document.getElementById('nama').value;
  if (!nama.trim()) {
    showNotification('Mohon isi nama guru terlebih dahulu!', 'warning');
    return;
  }
  
  // Ambil data dari form
  const nik = document.getElementById('nik').value;
  const jabatan = document.getElementById('jabatan').value;
  const unit = document.getElementById('unit').value;
  const pedagogik = document.getElementById('pedagogik').value;
  const profesional = document.getElementById('profesional').value;
  const kehadiran = document.getElementById('kehadiran').value;
  const sosial = document.getElementById('sosial').value;
  const kepribadian = document.getElementById('kepribadian').value;
  const catatan = document.getElementById('catatan').value;
  const tanggal = document.getElementById('tanggal').textContent;
  
  const rataRata = Math.round((parseInt(pedagogik) + parseInt(profesional) + parseInt(kehadiran) + parseInt(sosial) + parseInt(kepribadian)) / 5);
  
  // Buat konten Word dalam format HTML
  const wordContent = \`
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Laporan Kinerja - \${nama}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 40px;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
        <h2>YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI</h2>
        <h2>UNIT SMP DAN SMA ISLAM AL-GHOZALI</h2>
        <h3>Laporan Kinerja Guru 2025/2026</h3>
      </div>
      
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td><strong>Nama Guru:</strong></td>
          <td>\${nama}</td>
          <td><strong>NIK/NUPTK:</strong></td>
          <td>\${nik}</td>
        </tr>
        <tr>
          <td><strong>Jabatan:</strong></td>
          <td>\${jabatan}</td>
          <td><strong>Unit:</strong></td>
          <td>\${unit}</td>
        </tr>
      </table>
      
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f0f0f0;">
          <th>No</th>
          <th>Komponen Penilaian</th>
          <th>Skor Minimum</th>
          <th>Nilai Angka</th>
          <th>Predikat</th>
        </tr>
        <tr>
          <td style="text-align: center;">1</td>
          <td>Pedagogik</td>
          <td style="text-align: center;">70</td>
          <td style="text-align: center;">\${pedagogik}</td>
          <td style="text-align: center;">\${konversiNilai(pedagogik).predikat}</td>
        </tr>
        <tr>
          <td style="text-align: center;">2</td>
          <td>Profesional</td>
          <td style="text-align: center;">70</td>
          <td style="text-align: center;">\${profesional}</td>
          <td style="text-align: center;">\${konversiNilai(profesional).predikat}</td>
        </tr>
        <tr>
          <td style="text-align: center;">3</td>
          <td>Kehadiran</td>
          <td style="text-align: center;">80</td>
          <td style="text-align: center;">\${kehadiran}</td>
          <td style="text-align: center;">\${konversiNilai(kehadiran).predikat}</td>
        </tr>
        <tr>
          <td style="text-align: center;">4</td>
          <td>Sosial</td>
          <td style="text-align: center;">70</td>
          <td style="text-align: center;">\${sosial}</td>
          <td style="text-align: center;">\${konversiNilai(sosial).predikat}</td>
        </tr>
        <tr>
          <td style="text-align: center;">5</td>
          <td>Kepribadian</td>
          <td style="text-align: center;">70</td>
          <td style="text-align: center;">\${kepribadian}</td>
          <td style="text-align: center;">\${konversiNilai(kepribadian).predikat}</td>
        </tr>
        <tr style="background-color: #f8f8f8; font-weight: bold;">
          <td colspan="3" style="text-align: center;">RATA-RATA</td>
          <td style="text-align: center;">\${rataRata}</td>
          <td style="text-align: center;">\${konversiNilai(rataRata).predikat}</td>
        </tr>
      </table>
      
      <div style="margin: 30px 0;">
        <h4>Catatan dan Rekomendasi:</h4>
        <div style="border: 1px solid #ccc; padding: 15px; background-color: #f9f9f9;">
          \${catatan.replace(/\\n/g, '<br>')}
        </div>
      </div>
      
      <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div style="text-align: center;">
          <p>Kepala Sekolah</p>
          <br><br><br>
          <p>\${unit === 'SMP ISLAM AL-GHOZALI' ? 'Iswahyudin,SE' : 'Antoni Firdaus,SHI,M.Pd.'}</p>
        </div>
        <div style="text-align: center;">
          <p>Tanggal: \${tanggal}</p>
          <p>Penilai</p>
          <br><br><br>
          <p>Nurachman,S.Pd.I,M.Pd.</p>
        </div>
      </div>
    </body>
    </html>
  \`;
  
  // Buat blob dan download
  const blob = new Blob([wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = \`Laporan_Kinerja_\${nama.replace(/\\s+/g, '_')}.doc\`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification(\`Laporan \${nama} berhasil diexport ke Word! 📝\`, 'success');
}

function exportToPNG() {
  const nama = document.getElementById('nama').value;
  if (!nama.trim()) {
    showNotification('Mohon isi nama guru terlebih dahulu!', 'warning');
    return;
  }
  
  // Buat canvas untuk menggambar laporan
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set ukuran canvas (A4 ratio)
  canvas.width = 800;
  canvas.height = 1000;
  
  // Background putih
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Ambil data dari form
  const nik = document.getElementById('nik').value;
  const jabatan = document.getElementById('jabatan').value;
  const unit = document.getElementById('unit').value;
  const pedagogik = document.getElementById('pedagogik').value;
  const profesional = document.getElementById('profesional').value;
  const kehadiran = document.getElementById('kehadiran').value;
  const sosial = document.getElementById('sosial').value;
  const kepribadian = document.getElementById('kepribadian').value;
  const rataRata = Math.round((parseInt(pedagogik) + parseInt(profesional) + parseInt(kehadiran) + parseInt(sosial) + parseInt(kepribadian)) / 5);
  const tanggal = document.getElementById('tanggal').textContent;
  
  // Style text
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  
  // Header
  ctx.font = 'bold 18px Arial';
  ctx.fillText('YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI', canvas.width/2, 50);
  ctx.fillText('UNIT SMP DAN SMA ISLAM AL-GHOZALI', canvas.width/2, 75);
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Laporan Kinerja Guru 2025/2026', canvas.width/2, 110);
  
  // Garis pembatas
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 130);
  ctx.lineTo(750, 130);
  ctx.stroke();
  
  // Data guru
  ctx.textAlign = 'left';
  ctx.font = '14px Arial';
  ctx.fillText(\`Nama Guru: \${nama}\`, 50, 170);
  ctx.fillText(\`NIK/NUPTK: \${nik}\`, 400, 170);
  ctx.fillText(\`Jabatan: \${jabatan}\`, 50, 195);
  ctx.fillText(\`Unit: \${unit}\`, 400, 195);
  
  // Tabel header
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  const tableY = 240;
  const rowHeight = 30;
  
  // Gambar border tabel
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  
  // Header tabel
  ctx.fillRect(50, tableY, 700, rowHeight);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(51, tableY + 1, 698, rowHeight - 2);
  
  ctx.fillStyle = '#000000';
  ctx.fillText('No', 80, tableY + 20);
  ctx.fillText('Komponen Penilaian', 200, tableY + 20);
  ctx.fillText('Skor Min', 350, tableY + 20);
  ctx.fillText('Nilai', 450, tableY + 20);
  ctx.fillText('Predikat', 600, tableY + 20);
  
  // Data tabel
  const komponenData = [
    { no: 1, nama: 'Pedagogik', min: 70, nilai: pedagogik },
    { no: 2, nama: 'Profesional', min: 70, nilai: profesional },
    { no: 3, nama: 'Kehadiran', min: 80, nilai: kehadiran },
    { no: 4, nama: 'Sosial', min: 70, nilai: sosial },
    { no: 5, nama: 'Kepribadian', min: 70, nilai: kepribadian }
  ];
  
  ctx.font = '12px Arial';
  komponenData.forEach((item, index) => {
    const y = tableY + rowHeight + (index * rowHeight);
    
    // Background baris
    if (index % 2 === 1) {
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(51, y + 1, 698, rowHeight - 2);
    }
    
    ctx.fillStyle = '#000000';
    ctx.fillText(item.no.toString(), 80, y + 20);
    ctx.fillText(item.nama, 200, y + 20);
    ctx.fillText(item.min.toString(), 350, y + 20);
    ctx.fillText(item.nilai, 450, y + 20);
    ctx.fillText(konversiNilai(parseInt(item.nilai)).predikat, 600, y + 20);
    
    // Border baris
    ctx.strokeRect(50, y, 700, rowHeight);
  });
  
  // Rata-rata
  const avgY = tableY + rowHeight + (komponenData.length * rowHeight);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(51, avgY + 1, 698, rowHeight - 2);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('RATA-RATA', 200, avgY + 20);
  ctx.fillText(rataRata.toString(), 450, avgY + 20);
  ctx.fillText(konversiNilai(rataRata).predikat, 600, avgY + 20);
  ctx.strokeRect(50, avgY, 700, rowHeight);
  
  // Tanggal
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(\`Tanggal: \${tanggal}\`, 750, avgY + 80);
  
  // TTD
  ctx.textAlign = 'center';
  ctx.fillText('Kepala Sekolah', 200, avgY + 120);
  ctx.fillText('Penilai', 600, avgY + 120);
  
  const namaKepsekPNG = unit === 'SMP ISLAM AL-GHOZALI' ? 'Iswahyudin,SE' : 'Antoni Firdaus,SHI,M.Pd.';
  ctx.fillText(namaKepsekPNG, 200, avgY + 200);
  ctx.fillText('Nurachman,S.Pd.I,M.Pd.', 600, avgY + 200);
  
  // Border tabel lengkap
  ctx.strokeRect(50, tableY, 700, rowHeight + (komponenData.length + 1) * rowHeight);
  
  // Download PNG
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`Laporan_Kinerja_\${nama.replace(/\\s+/g, '_')}.png\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
  
  showNotification(\`Laporan \${nama} berhasil diexport ke PNG! 🖼️\`, 'success');
}

// Fungsi export rekapitulasi
function exportRekapPDF() {
  if (dataKaryawan.length === 0) {
    showNotification('Tidak ada data untuk diexport!', 'warning');
    return;
  }
  
  // Buat konten untuk print
  const printContent = \`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rekapitulasi Kinerja Karyawan 2025/2026</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 12px; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 10px; border: 1px solid #ccc; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI</h1>
      <h2>Rekapitulasi Kinerja Karyawan 2025/2026</h2>
      
      <div class="stats">
        <div class="stat-box">
          <h3>Total Karyawan</h3>
          <div style="font-size: 24px; font-weight: bold;">\${dataKaryawan.length}</div>
        </div>
        <div class="stat-box">
          <h3>Rata-rata Keseluruhan</h3>
          <div style="font-size: 24px; font-weight: bold;">\${Math.round(dataKaryawan.reduce((sum, k) => sum + k.rataRata, 0) / dataKaryawan.length)}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Jabatan</th>
            <th>Unit</th>
            <th>Pedagogik</th>
            <th>Profesional</th>
            <th>Kehadiran</th>
            <th>Sosial</th>
            <th>Kepribadian</th>
            <th>Rata-rata</th>
            <th>Predikat</th>
          </tr>
        </thead>
        <tbody>
          \${dataKaryawan.map((k, i) => \`
            <tr>
              <td>\${i + 1}</td>
              <td>\${k.nama}</td>
              <td>\${k.jabatan}</td>
              <td>\${k.unit}</td>
              <td>\${k.pedagogik}</td>
              <td>\${k.profesional}</td>
              <td>\${k.kehadiran}</td>
              <td>\${k.sosial}</td>
              <td>\${k.kepribadian}</td>
              <td style="font-weight: bold;">\${k.rataRata}</td>
              <td>\${k.predikat}</td>
            </tr>
          \`).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 50px; text-align: right;">
        <p>Tanggal: \${new Date().toLocaleDateString('id-ID')}</p>
        <br><br><br>
        <p>Kepala Sekolah</p>
        <br><br>
        <p>Antoni Firdaus,SHI,M.Pd.</p>
      </div>
    </body>
    </html>
  \`;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
  
  showNotification('Rekapitulasi berhasil diexport ke PDF! 📄', 'success');
}

function exportRekapWord() {
  if (dataKaryawan.length === 0) {
    showNotification('Tidak ada data untuk diexport!', 'warning');
    return;
  }
  
  const wordContent = \`
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rekapitulasi Kinerja Karyawan 2025/2026</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 40px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1>YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI</h1>
        <h2>Rekapitulasi Kinerja Karyawan 2025/2026</h2>
      </div>
      
      <div style="display: flex; justify-content: space-around; margin: 30px 0;">
        <div style="text-align: center; padding: 15px; border: 1px solid #ccc;">
          <h3>Total Karyawan</h3>
          <div style="font-size: 24px; font-weight: bold;">\${dataKaryawan.length}</div>
        </div>
        <div style="text-align: center; padding: 15px; border: 1px solid #ccc;">
          <h3>Rata-rata Keseluruhan</h3>
          <div style="font-size: 24px; font-weight: bold;">\${Math.round(dataKaryawan.reduce((sum, k) => sum + k.rataRata, 0) / dataKaryawan.length)}</div>
        </div>
      </div>
      
      <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 10px;">No</th>
            <th style="padding: 10px;">Nama</th>
            <th style="padding: 10px;">Jabatan</th>
            <th style="padding: 10px;">Unit</th>
            <th style="padding: 10px;">Pedagogik</th>
            <th style="padding: 10px;">Profesional</th>
            <th style="padding: 10px;">Kehadiran</th>
            <th style="padding: 10px;">Sosial</th>
            <th style="padding: 10px;">Kepribadian</th>
            <th style="padding: 10px;">Rata-rata</th>
            <th style="padding: 10px;">Predikat</th>
          </tr>
        </thead>
        <tbody>
          \${dataKaryawan.map((k, i) => \`
            <tr>
              <td style="padding: 8px; text-align: center;">\${i + 1}</td>
              <td style="padding: 8px;">\${k.nama}</td>
              <td style="padding: 8px;">\${k.jabatan}</td>
              <td style="padding: 8px;">\${k.unit}</td>
              <td style="padding: 8px; text-align: center;">\${k.pedagogik}</td>
              <td style="padding: 8px; text-align: center;">\${k.profesional}</td>
              <td style="padding: 8px; text-align: center;">\${k.kehadiran}</td>
              <td style="padding: 8px; text-align: center;">\${k.sosial}</td>
              <td style="padding: 8px; text-align: center;">\${k.kepribadian}</td>
              <td style="padding: 8px; text-align: center; font-weight: bold;">\${k.rataRata}</td>
              <td style="padding: 8px; text-align: center;">\${k.predikat}</td>
            </tr>
          \`).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 50px; text-align: right;">
        <p>Tanggal: \${new Date().toLocaleDateString('id-ID')}</p>
        <br><br><br>
        <p>Kepala Sekolah</p>
        <br><br>
        <p>Antoni Firdaus,SHI,M.Pd.</p>
      </div>
    </body>
    </html>
  \`;
  
  const blob = new Blob([wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Rekapitulasi_Kinerja_Karyawan.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showNotification('Rekapitulasi berhasil diexport ke Word! 📝', 'success');
}

function exportRekapExcel() {
  if (dataKaryawan.length === 0) {
    showNotification('Tidak ada data untuk diexport!', 'warning');
    return;
  }
  
  // Simulasi export Excel dengan membuat CSV
  let csvContent = "No,Nama,Jabatan,Unit,Pedagogik,Profesional,Kehadiran,Sosial,Kepribadian,Rata-rata,Predikat\\n";
  
  dataKaryawan.forEach((karyawan, index) => {
    csvContent += \`\${index + 1},"\${karyawan.nama}","\${karyawan.jabatan}","\${karyawan.unit}",\${karyawan.pedagogik},\${karyawan.profesional},\${karyawan.kehadiran},\${karyawan.sosial},\${karyawan.kepribadian},\${karyawan.rataRata},"\${karyawan.predikat}"\\n\`;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'Rekapitulasi_Kinerja_Karyawan.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Rekapitulasi berhasil diexport ke Excel! 📊', 'success');
}

function exportRekapPNG() {
  if (dataKaryawan.length === 0) {
    showNotification('Tidak ada data untuk diexport!', 'warning');
    return;
  }
  
  // Buat canvas untuk rekapitulasi
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set ukuran canvas yang lebih besar untuk tabel
  canvas.width = 1200;
  canvas.height = 800 + (dataKaryawan.length * 30);
  
  // Background putih
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Header
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL-GHOZALI', canvas.width/2, 40);
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Rekapitulasi Kinerja Karyawan 2025/2026', canvas.width/2, 80);
  
  // Statistik
  const totalKaryawan = dataKaryawan.length;
  const rataKeseluruhan = Math.round(dataKaryawan.reduce((sum, k) => sum + k.rataRata, 0) / dataKaryawan.length);
  
  ctx.font = 'bold 16px Arial';
  ctx.fillText(\`Total Karyawan: \${totalKaryawan}\`, canvas.width/2 - 150, 130);
  ctx.fillText(\`Rata-rata Keseluruhan: \${rataKeseluruhan}\`, canvas.width/2 + 150, 130);
  
  // Tabel header
  const tableY = 170;
  const rowHeight = 30;
  const colWidths = [50, 150, 120, 120, 80, 80, 80, 80, 80, 80, 100];
  let currentX = 50;
  
  // Header background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(50, tableY, canvas.width - 100, rowHeight);
  
  // Header text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  
  const headers = ['No', 'Nama', 'Jabatan', 'Unit', 'Pedagogik', 'Profesional', 'Kehadiran', 'Sosial', 'Kepribadian', 'Rata-rata', 'Predikat'];
  
  headers.forEach((header, index) => {
    ctx.fillText(header, currentX + colWidths[index]/2, tableY + 20);
    currentX += colWidths[index];
  });
  
  // Border header
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, tableY, canvas.width - 100, rowHeight);
  
  // Data rows
  ctx.font = '11px Arial';
  dataKaryawan.forEach((karyawan, index) => {
    const y = tableY + rowHeight + (index * rowHeight);
    currentX = 50;
    
    // Background baris
    if (index % 2 === 1) {
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(51, y + 1, canvas.width - 102, rowHeight - 2);
    }
    
    ctx.fillStyle = '#000000';
    
    // Data
    const rowData = [
      (index + 1).toString(),
      karyawan.nama.length > 18 ? karyawan.nama.substring(0, 15) + '...' : karyawan.nama,
      karyawan.jabatan.length > 15 ? karyawan.jabatan.substring(0, 12) + '...' : karyawan.jabatan,
      karyawan.unit.includes('SMP') ? 'SMP' : 'SMA',
      karyawan.pedagogik.toString(),
      karyawan.profesional.toString(),
      karyawan.kehadiran.toString(),
      karyawan.sosial.toString(),
      karyawan.kepribadian.toString(),
      karyawan.rataRata.toString(),
      karyawan.predikat
    ];
    
    rowData.forEach((data, colIndex) => {
      if (colIndex === 9) { // Rata-rata column
        ctx.font = 'bold 11px Arial';
        // Warna berdasarkan nilai
        if (karyawan.rataRata >= 85) ctx.fillStyle = '#28a745';
        else if (karyawan.rataRata >= 70) ctx.fillStyle = '#007bff';
        else ctx.fillStyle = '#dc3545';
      } else {
        ctx.font = '11px Arial';
        ctx.fillStyle = '#000000';
      }
      
      ctx.fillText(data, currentX + colWidths[colIndex]/2, y + 20);
      currentX += colWidths[colIndex];
    });
    
    // Border baris
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(50, y, canvas.width - 100, rowHeight);
    currentX = 50;
  });
  
  // Tanggal dan TTD
  const footerY = tableY + rowHeight + (dataKaryawan.length * rowHeight) + 50;
  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(\`Tanggal: \${new Date().toLocaleDateString('id-ID')}\`, canvas.width - 100, footerY);
  
  ctx.textAlign = 'center';
  ctx.fillText('Kepala Sekolah', canvas.width - 200, footerY + 40);
  ctx.fillText('Antoni Firdaus,SHI,M.Pd.', canvas.width - 200, footerY + 120);
  
  // Download PNG
  canvas.toBlob(function(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Rekapitulasi_Kinerja_Karyawan.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
  
  showNotification('Rekapitulasi berhasil diexport ke PNG! 🖼️', 'success');
}

// Tutup modal jika klik di luar
window.onclick = function(event) {
  const modal = document.getElementById('rekapModal');
  if (event.target === modal) {
    closeRekapitulasi();
  }
}

// Tambah data sample jika belum ada
if (dataKaryawan.length === 0) {
  dataKaryawan = [
    {
      id: 1,
      nama: 'Ahmad Fauzi, S.Pd',
      jabatan: 'Guru Matematika',
      unit: 'SMP ISLAM AL-GHOZALI',
      pedagogik: 85,
      profesional: 80,
      kehadiran: 90,
      sosial: 75,
      kepribadian: 88,
      rataRata: 84,
      predikat: 'Baik Sekali'
    },
    {
      id: 2,
      nama: 'Siti Nurhaliza, S.Pd',
      jabatan: 'Guru Bahasa Indonesia',
      unit: 'SMA ISLAM AL-GHOZALI',
      pedagogik: 78,
      profesional: 82,
      kehadiran: 85,
      sosial: 80,
      kepribadian: 85,
      rataRata: 82,
      predikat: 'Baik Sekali'
    },
    {
      id: 3,
      nama: 'Muhammad Rizki, S.Si',
      jabatan: 'Guru Fisika',
      unit: 'SMA ISLAM AL-GHOZALI',
      pedagogik: 65,
      profesional: 70,
      kehadiran: 75,
      sosial: 68,
      kepribadian: 72,
      rataRata: 70,
      predikat: 'Baik'
    }
  ];
  localStorage.setItem('dataKaryawan', JSON.stringify(dataKaryawan));
}

// Inisialisasi nilai awal
updateNilai();

// Set nama kepala sekolah awal berdasarkan unit default
const unitDefault = document.getElementById('unit').value;
const namaKepsekDefault = document.getElementById('namaKepsek');
if (unitDefault === 'SMP ISLAM AL-GHOZALI') {
  namaKepsekDefault.textContent = 'Iswahyudin,SE';
} else {
  namaKepsekDefault.textContent = 'Antoni Firdaus,SHI,M.Pd.';
}
</script>
</body>
</html>
`;

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    isOpen, onClose, links, onAddLink, onDeleteLink,
    onBackupData, onRestoreData, onAddTeachers
}) => {
  const [newUserName, setNewUserName] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('performanceReport');

  const handleAddClick = () => {
    if (newUserName.trim()) {
      onAddLink(newUserName.trim());
      setNewUserName('');
    }
  };

  const handleCopyClick = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    });
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            let teachers: string[] = [];

            if (file.name.endsWith('.csv')) {
                teachers = text.split('\n')
                             .map(line => line.split(',')[0].trim())
                             .filter(name => name.length > 0);
                // Simple header check
                if (teachers[0] && (teachers[0].toLowerCase().includes('nama') || teachers[0].toLowerCase().includes('name'))) {
                    teachers.shift();
                }
            } else if (file.name.endsWith('.json')) {
                const data = JSON.parse(text);
                if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
                    teachers = data;
                } else {
                    throw new Error("Format JSON tidak valid. Harusnya berupa array of strings. Contoh: [\"Guru A\", \"Guru B\"]");
                }
            } else {
                throw new Error("Format file tidak didukung. Gunakan .csv atau .json.");
            }
            
            if (teachers.length > 0) {
                onAddTeachers(teachers);
            } else {
                throw new Error("Tidak ada nama guru yang ditemukan dalam file.");
            }

        } catch (err) {
            console.error("Import failed:", err);
            alert(`Gagal mengimpor file: ${(err as Error).message}`);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };


  if (!isOpen) return null;

  const renderContent = () => {
    switch(activeTab) {
        case 'performanceReport':
             return (
                <div className="w-full h-full bg-gray-200">
                    <iframe
                        srcDoc={reportHtml}
                        title="Laporan Kinerja Guru"
                        className="w-full h-full border-0 rounded-md"
                        sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                    />
                </div>
            );
        case 'tracking':
            return (
                <div>
                    <div className="mb-6 border-b pb-6">
                        <h3 className="text-lg font-semibold mb-2">Buat Tautan Pengguna Baru</h3>
                        <div className="flex items-center space-x-2">
                            <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Nama Pengguna (Contoh: Budi)" className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            <button onClick={handleAddClick} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Buat Link</button>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">Tautan yang Dihasilkan</h3>
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                             <tr>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link Unik</th>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penggunaan</th>
                               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tindakan</th>
                             </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                             {links.map(link => (
                               <tr key={link.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{link.userName}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><div className="flex items-center space-x-2"><input type="text" readOnly value={link.url} className="w-full bg-gray-100 p-1 rounded border text-xs" /><button onClick={() => handleCopyClick(link.url)} className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">{copiedUrl === link.url ? 'Tersalin!' : 'Salin'}</button></div></td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-center">{link.usageCount}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => onDeleteLink(link.id)} className="text-red-600 hover:text-red-900">Hapus</button></td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                    </div>
                </div>
            );
        case 'dataManagement':
            return (
                 <div>
                    <h3 className="text-lg font-semibold mb-4">Backup & Restore Data</h3>
                    <div className="p-4 border rounded-lg bg-yellow-50 text-yellow-800 mb-6">
                        <p><strong>Penting:</strong> Fitur ini memungkinkan Anda menyimpan semua data aplikasi (riwayat, log, laporan kinerja, dll.) ke dalam satu file. Anda dapat menggunakan file ini untuk memindahkan data ke komputer lain atau sebagai cadangan.</p>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-700">Backup Data</h4>
                            <p className="text-sm text-gray-600 mb-2">Unduh semua data aplikasi ke dalam file JSON.</p>
                            <button onClick={onBackupData} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Backup Semua Data</button>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">Restore Data</h4>
                            <p className="text-sm text-gray-600 mb-2">Unggah file backup JSON untuk memulihkan data. <strong className="text-red-600">Awas: Ini akan menimpa semua data yang ada saat ini.</strong></p>
                            <input
                                type="file"
                                accept=".json"
                                onChange={onRestoreData}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Impor Data Guru</h3>
                        <div className="p-4 border rounded-lg bg-blue-50 text-blue-800 mb-6">
                            <p><strong>Impor daftar guru secara massal dari file CSV atau JSON.</strong></p>
                            <p className="mt-2 text-sm">
                                <strong>Format CSV:</strong> Satu kolom berisi nama guru, satu nama per baris. Header opsional.<br/>
                                <code className="text-xs block bg-blue-100 p-1 rounded mt-1">
                                    Nama Guru<br/>
                                    Andi Wijaya, S.Pd.<br/>
                                    Budi Santoso, M.Pd.<br/>
                                </code>
                            </p>
                            <p className="mt-2 text-sm">
                                <strong>Format JSON:</strong> Array berisi string nama guru.<br/>
                                <code className="text-xs block bg-blue-100 p-1 rounded mt-1">["Andi Wijaya, S.Pd.", "Budi Santoso, M.Pd."]</code>
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".csv,.json"
                            onChange={handleFileImport}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                </div>
            );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-lg max-w-5xl w-full p-6 shadow-xl flex flex-col" style={{ height: '90vh' }}>
        <div className="flex items-start justify-between mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ruang Admin</h2>
            <p className="text-gray-600">Kelola pengguna, pantau kinerja, dan backup data aplikasi.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="mb-6 flex-shrink-0">
            <div className="bg-gray-100 p-1.5 rounded-xl flex items-center justify-center space-x-2">
                 <button
                    onClick={() => setActiveTab('performanceReport')}
                    className={`flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === 'performanceReport'
                            ? 'bg-white text-indigo-700 shadow-md'
                            : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
                     </svg>
                    <span>Raport Kinerja Guru</span>
                </button>
                <button
                    onClick={() => setActiveTab('tracking')}
                    className={`flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === 'tracking'
                            ? 'bg-white text-indigo-700 shadow-md'
                            : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5 3-3zm-2.828 8.414a2 2 0 012.828 0l3 3a2 2 0 01-2.828 2.828l-3-3a2 2 0 010-2.828zM5 9a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Pelacakan Pengguna</span>
                </button>
                <button
                    onClick={() => setActiveTab('dataManagement')}
                    className={`flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === 'dataManagement'
                            ? 'bg-white text-indigo-700 shadow-md'
                            : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                      <path d="M10 2C6.134 2 3 3.343 3 5s3.134 3 7 3 7-1.343 7-3-3.134-3-7-3z" />
                    </svg>
                    <span>Manajemen Data</span>
                </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;