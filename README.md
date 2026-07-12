# Terminal Risiko & Position Sizing

Kalkulator tingkat profesional untuk menghitung ukuran posisi (position sizing), leverage maksimal, risiko nominal, dan perlindungan likuidasi dengan visualisasi target profit berbasis Rasio Emas Fibonacci (Golden Ratio).

---

## 📌 Deskripsi Proyek
Aplikasi ini membantu trader futures dan derivatif merencanakan manajemen risiko secara presisi sebelum melakukan entri. Melalui input modal (equity), persentase risiko, stop loss, dan leverage, sistem menghitung parameter posisi trading secara sinkron, menghindari risiko "likuidasi mendahului stop loss" (Liquidation Price < Stop Loss Price untuk Long, atau > untuk Short), serta menyediakan proyeksi sasaran profit berbasis deret Fibonacci (1.618R, 2.618R, 3.618R).

---

## 🗺️ Visualisasi Aliran & Code Graph

Berikut adalah grafik hubungan kode sumber (Code Graph) yang menggambarkan struktur modularitas proyek:

```text
       [ index.html ] (Browser Viewport)
              │
              ▼
       [ src/main.tsx ] (Entry Point)
              │
              ▼
       [ src/index.css ] (Global Styling & Typography)
              │
              ▼
       [ src/App.tsx ] (State Engine & Core UI)
              │
              ├─► State Manajemen (Equity, Risk %, SL %, Leverage, Entry, TP)
              ├─► Sinkronisasi Kalkulasi Formula Matematika Finansial
              │
              ├─► [ Proyeksi Target Fibonacci ] ──► (Bilah Progres Relatif)
              │
              └─► [ src/components/RiskRewardChart.tsx ] (Recharts Engine)
                      ├─► Analisis Kinerja Histori (Nominal USD)
                      └─► Tren Kelayakan Rasio RRR & Paparan Likuidasi Dini
```

---

## 📐 Kerangka Formula & Mekanisme Kalkulasi

Seluruh kalkulasi dilakukan secara **SINKRON** di dalam React Render Loop (`useMemo` block) untuk menjamin pemutakhiran instan tanpa jeda asinkron (zero-latency update):

### 1. Risiko Nominal (Risk USD)
Menentukan jumlah kerugian maksimal dalam mata uang USD jika posisi menyentuh Stop Loss:
$$\text{Risk USD} = \text{Equity} \times \left( \frac{\text{Risk Percent}}{100} \right)$$

### 2. Ukuran Posisi Riil (Position Size USD)
Berdasarkan jarak persentase Stop Loss dari titik entry, menentukan nilai posisi total yang perlu dibuka:
$$\text{Position USD} = \frac{\text{Risk USD}}{\left( \frac{\text{SL Percent}}{100} \right)}$$

### 3. Margin Terpakai (Margin USD)
Nilai jaminan nominal yang dikunci bursa berdasarkan leverage yang digunakan:
$$\text{Margin USD} = \frac{\text{Position USD}}{\text{Leverage}}$$

### 4. Batas Leverage Maksimum Aman
Untuk mencegah harga likuidasi terjadi sebelum harga stop loss (likuidasi dini):
$$\text{Max Safe Leverage} = \frac{100}{\text{SL Percent}}$$

### 5. Proyeksi Target Profit Golden Ratio (Fibonacci Targets)
Menentukan target profit berdasarkan kelipatan nilai risiko (R-value) dengan rasio emas Fibonacci:
*   **TP1 (1.618R):** $\text{Entry Price} \pm \left( \text{Entry Price} \times \frac{\text{SL Percent} \times 1.618}{100} \right)$
*   **TP2 (2.618R):** $\text{Entry Price} \pm \left( \text{Entry Price} \times \frac{\text{SL Percent} \times 2.618}{100} \right)$
*   **TP3 (3.618R):** $\text{Entry Price} \pm \left( \text{Entry Price} \times \frac{\text{SL Percent} \times 3.618}{100} \right)$

---

## 📊 Visualisasi Dashboard Kinerja
Proyek dilengkapi dengan dua visualisasi interaktif utama:
1.  **Komparasi Nominal USD**: Batang perbandingan antara risiko maksimal (merah) dan potensi imbalan (hijau) dari data log historis.
2.  **Rasio & Tren RRR**: Garis tren pergerakan Risk-to-Reward Ratio (RRR) dari entri ke entri, lengkap dengan indikator batas aman kelayakan minimum (1 : 1.5) dan area kritis likuidasi dini.
