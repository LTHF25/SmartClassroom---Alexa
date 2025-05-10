# Alexa for Classroom: Otomatisasi Pencahayaan Berbasis AI & IoT

🧠 **Tujuan Ringkas**  
Mengembangkan sistem pencahayaan otomatis di dalam ruang kelas berbasis sensor intensitas cahaya (LDR), dengan kontrol menggunakan mikrokontroler ESP32 dan dimming lampu via MOSFET. Sistem ini menjadi bagian awal dari konsep smart classroom yang akan diperluas dengan asisten AI dan komponen pendukung lainnya.

## ⚙️ Komponen Utama yang Digunakan

| **Komponen**         | **Fungsi**                                   |
|-----------------------|---------------------------------------------|
| ESP32 Devkit V1       | Mikrokontroler utama dengan WiFi built-in   |
| LDR + Resistor 10k    | Sensor untuk mengukur intensitas cahaya     |
| IRF540N MOSFET        | Pengatur arus ke LED (PWM untuk dimming)    |
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
- Integrasi dengan AI (Gemini / ChatGPT).
- Pengontrolan suara (via web atau voice assistant).
- Pengelolaan beberapa kelas berbasis jaringan.
- Penambahan sensor suhu, kualitas udara, dan deteksi kehadiran.


mkdir voice-proxy
cd voice-proxy
npm init -y
npm install express crypto


// ========================
// 1. SETUP SERVER PROXY (Node.js)
// ========================
// Buat file bernama server.js dan isi dengan ini:

const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

const APPID = 'YOUR_APPID';
const APIKey = 'YOUR_APIKEY';
const APISecret = 'YOUR_APISECRET';

app.get('/getTTSUrl', (req, res) => {
  const host = 'tts-api.xfyun.cn';
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;
  const signatureSha = crypto.createHmac('sha256', APISecret)
    .update(signatureOrigin).digest('base64');
  const authorizationOrigin = `api_key=\"${APIKey}\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"${signatureSha}\"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  const url = `wss://${host}/v2/tts?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
  res.json({ url });
});

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});

// ========================
// 2. CLIENT-SIDE (Script.js)
// ========================
// Tambahkan fungsi ini ke dalam script.js kamu:

async function speakWithIFlytek(text) {
  try {
    const response = await fetch('http://localhost:3000/getTTSUrl');
    const { url } = await response.json();

    const ws = new WebSocket(url);
    let audioChunks = [];

    ws.onopen = () => {
      const ttsParams = {
        common: {
          app_id: 'YOUR_APPID',
        },
        business: {
          aue: 'lame',
          auf: 'audio/L16;rate=16000',
          vcn: 'aisxping',
          tte: 'utf8'
        },
        data: {
          status: 2,
          text: btoa(unescape(encodeURIComponent(text)))
        }
      };
      ws.send(JSON.stringify(ttsParams));
    };

    ws.onmessage = (e) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = JSON.parse(reader.result);
        if (res.code !== 0) {
          console.error('TTS Error:', res.message);
          ws.close();
          return;
        }
        if (res.data && res.data.audio) {
          const audio = atob(res.data.audio);
          const audioBuffer = new Uint8Array(audio.length);
          for (let i = 0; i < audio.length; i++) {
            audioBuffer[i] = audio.charCodeAt(i);
          }
          audioChunks.push(audioBuffer);

          if (res.data.status === 2) {
            const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            const audioPlayer = new Audio(audioUrl);
            audioPlayer.play();
            ws.close();
          }
        }
      };
      reader.readAsText(e.data);
    };

    ws.onerror = (e) => {
      console.error('WebSocket Error:', e);
    };
  } catch (error) {
    console.error('TTS Connection Failed:', error);
  }
}

// ========================
// 3. GABUNGKAN DENGAN HASIL GEMINI
// ========================
// Setelah dapat response dari Gemini API:

// const responseText = jsonResponse.candidates[0].content.parts[0].text;
// speakWithIFlytek(responseText);
