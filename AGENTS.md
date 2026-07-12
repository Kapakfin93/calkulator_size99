# AI Agent Guidelines & Project Memory Pool

File ini menyimpan memori arsitektur, batasan desain, serta instruksi khusus untuk pengembangan aplikasi **Terminal Risiko & Position Sizing**. File ini diinjeksikan otomatis ke instruksi agen AI di setiap sesi kerja guna mencegah terjadinya kemunduran logika (regresi) atau perubahan konsep desain.

---

## 💾 Project Memory Pool (Riwayat Perubahan & Status Terakhir)

*   **Sesi 1 (Visualisasi Log)**: Integrasi Recharts di `RiskRewardChart.tsx` untuk menampilkan perbandingan nominal risiko/imbalan historis dan sebaran nilai RRR.
*   **Sesi 2 (Fibonacci Golden Targets)**: Penambahan generator target otomatis TP1 (1.618R), TP2 (2.618R), dan TP3 (3.618R) berdasarkan stop loss yang diinput, lengkap dengan grafik progres linear dinamis di bawah kalkulator.
*   **Sesi 3 (Arsitektur 3-Layer & Modularisasi)**: Dekomposisi besar-besaran `App.tsx` (Big Ball of Mud) menjadi arsitektur berbasis *Layer* (Logic di `hooks/`, Render di `components/`, dan `App.tsx` murni sebagai Orchestrator). Semua kalkulasi yang sebelumnya menumpuk di file utama dipisah. Pemasangan fitur *Synchronized Conclusion Badge* untuk F&G dan L/S ratio.

---

## 🛠️ Aturan Pengembangan & Arsitektur Utama

### 1. Peta Arsitektur Proyek (3-Layer Orchestrator)
Sistem ini menggunakan arsitektur modular yang ketat. **Dilarang keras menyatukan logika kalkulasi dengan antarmuka pengguna dalam satu file besar.**
*   **Logic Layer (`src/hooks/`)**: Otak aplikasi.
    *   `useRiskCalculator.ts`: Semua formula matematika finansial (Risiko, Margin, Leverage Maksimum, Likuidasi, Target Fibonacci) dihitung menggunakan `useMemo` di sini.
    *   `useMarketData.ts`: Penarikan data pasar asinkron (Fear & Greed, Long/Short Ratio).
    *   `useSavedSetups.ts`: Penyimpanan lokal via `localStorage` (sebagai pengganti IndexedDB sementara).
*   **UI Layer (`src/components/`)**: Murni untuk render visual. Menerima data matang (state) via *props*. 
    *   `Header.tsx`, `Sidebar.tsx`, `InputPanel.tsx`, `OutputPanel.tsx`, `HistoryPanel.tsx`.
*   **Orchestrator (`src/App.tsx`)**: Hanya sebagai konduktor penghubung antara UI Layer dan Logic Layer. Tidak boleh ada logika *useMemo* kalkulasi harga di dalam sini.

### 2. Panduan Keamanan Finansial (Sangat Penting)
*   **Keamanan Likuidasi**: Lindungi pengguna dari risiko likuidasi dini. Tampilkan indikator peringatan bahaya yang mencolok jika:
    $$\text{Leverage} > \frac{100}{\text{SL Percent}}$$
    Ini menandakan harga likuidasi akan tersentuh sebelum menyentuh Stop Loss.

### 3. Panduan Antarmuka & Tema Visual
*   **Tema Monokrom Gelap Profesional (Cosmic Slate)**: Visual didesain menggunakan palet slate (`bg-[#0A0B0D]`, `bg-[#111419]`, `border-[#2D3139]`) dengan aksen warna fungsional:
    *   `rose-500` untuk Stop Loss dan Area Risiko.
    *   `emerald-500` untuk Target Profit dan Area Imbalan.
    *   `amber-500` untuk level Golden Fibonacci TP1.
*   **Estetika Tipografi**: Gunakan font berseri monospace untuk data numerik keuangan guna meningkatkan tingkat keterbacaan (gunakan `font-mono text-xs`).

### 4. Batasan Teknis & Larangan Over-Engineering
*   **Tanpa Larping Sistem**: Dilarang membuat visual logs tiruan, status konektivitas tiruan, status port bursa, atau data visual sampah yang tidak fungsional (anti-AI slop).
*   **Interaktivitas Langsung**: Setiap tombol atau indikator target profit harus memiliki fungsionalitas ketika diklik, yaitu memuat ulang harga tersebut langsung ke dalam kalkulator tanpa memaksa pengguna menginput manual.
