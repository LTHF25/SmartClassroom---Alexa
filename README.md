# Alexa for Classroom: Otomatisasi Pencahayaan Berbasis AI & IoT

🧠 **Tujuan Ringkas**  
Mengembangkan sistem pencahayaan otomatis di dalam ruang kelas berbasis sensor intensitas cahaya (LDR), dengan kontrol menggunakan mikrokontroler ESP32 dan dimming lampu via MOSFET. Sistem ini menjadi bagian awal dari konsep smart classroom yang akan diperluas dengan asisten AI dan komponen pendukung lainnya.

## ⚙️ Komponen Utama yang Digunakan

| **Komponen**         | **Fungsi**                                   |
|-----------------------|---------------------------------------------|
| ESP32 Devkit V1       | Mikrokontroler utama dengan WiFi built-in   |
| LDR + Resistor 10k    | Sensor untuk mengukur intensitas cahaya     |
| IRLZ44N MOSFET        | Pengatur arus ke LED (PWM untuk dimming)    |
| LED Strip 12V         | Lampu utama sistem pencahayaan              |
| Power Supply 12V 2A   | Catu daya lampu                             |
| DC Jack Adapter       | Konektor ke power supply                   |

## 💡 Mekanisme Kerja Singkat
1. Sensor LDR membaca intensitas cahaya alami di dalam ruangan.
2. Data dari LDR diproses oleh ESP32.
3. ESP32 mengatur kecerahan LED strip secara otomatis via PWM ke MOSFET.
4. Semakin terang cahaya luar, semakin redup lampu – dan sebaliknya.

Sistem ini bisa dikembangkan lebih lanjut untuk terintegrasi ke AI Asisten dan sistem jaringan antarkelas.

## 📈 Rencana Implementasi Lanjut
Setelah versi awal berjalan baik, sistem akan dikembangkan menjadi:
- Integrasi dengan AI (Gemini / ChatGPT). (sedang proses)
- Pengontrolan suara (via web atau voice assistant). 
- Pengelolaan beberapa kelas berbasis jaringan.
- Penambahan sensor suhu, kualitas udara, dan deteksi kehadiran.

