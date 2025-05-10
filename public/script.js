const ChatContainer = document.querySelector(".chats-container");
const PromptForm = document.querySelector(".prompt-form");
const PromptInput = PromptForm.querySelector(".prompt-input");
const StopButton = document.getElementById("stop-response-btn");
const SendButton = document.getElementById("send-prompt-btn");
const deleteButton = document.getElementById("delete-btn");
const LightMode = document.getElementById("theme-toggle-btn");

// const API_KEY = "AIzaSyBKP_scjOxgkw9po7Bs_n1z2-sQGe8Mrdc";
const API_URL = "/generate";

let userMessage = "";
let stopTyping = false;
const chatHistory = [];

// Fungsi untuk mengontrol tombol stop
const toggleStopButton = (show) => {
  if (show) {
    StopButton.style.display = "inline-block";
    StopButton.removeAttribute("disabled");
  } else {
    StopButton.style.display = "none";
    StopButton.setAttribute("disabled", "true");
  }
};

// Fungsi scroll otomatis
const scrollToBottom = () => {
  setTimeout(() => {
    ChatContainer.scrollTop = ChatContainer.scrollHeight;
  }, 100);
};

// Fungsi membuat elemen pesan
const createMsgElement = (content, classname, isBot = false) => {
  const div = document.createElement("div");
  div.classList.add("pesan", classname);

  if (isBot) {
    const img = document.createElement("img");
    img.classList.add("avatar");
    img.src = "/image/gemini-chatbot-logo.svg";
    img.alt = "gemini";
    div.appendChild(img);
  }

  const p = document.createElement("p");
  p.classList.add("pesan-text");
  p.innerHTML = content;

  div.appendChild(p);
  return div;
};

// Efek mengetik dengan fitur stop
const typeText = (element, text, index = 0) => {
  if (stopTyping) {
    // element.textContent = text;
    toggleStopButton(false);
    scrollToBottom();
    return;
  }

  if (index < text.length) {
    element.textContent += text.charAt(index);
    setTimeout(() => typeText(element, text, index + 1), 20);
  } else {
    toggleStopButton(false);
    scrollToBottom();
  }
};

// Fungsi untuk membersihkan teks respons AI agar rapi
const cleanResponseText = (text) => {
  return text
    .replace(/^\*+\s*/gm, "") // Hapus asterisk (bullet) di awal baris
    .replace(/\*+\s*$/gm, "") // Hapus asterisk di akhir baris
    .replace(/\*\*(.*?)\*\*/g, "$1") // Hapus penanda markdown bold
    .replace(/\n{2,}/g, "\n")
    .replace(/\*/g, "")       // Hapus semua tanda asterisk
    .replace(/\n{2,}/g, "\n")   // Hapus newline berlebihan // Hapus newline berlebihan
    .trim(); // Hapus spasi di awal dan akhir
};

// Fungsi mendapatkan respons AI
const generateResponse = async (botLoadingDiv) => {
  const textElement = botLoadingDiv.querySelector(".pesan-text");

  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  stopTyping = false;
  toggleStopButton(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Error");

    const rawText =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content.parts[0].text
        ? data.candidates[0].content.parts[0].text.trim()
        : "Maaf, saya tidak dapat memahami pertanyaan Anda.";

    const responseText = cleanResponseText(rawText);
    textElement.textContent = "";
    typeText(textElement, responseText);
  } catch (error) {
    console.error(error);
    textElement.textContent = "Terjadi kesalahan saat mengambil respons AI.";
    toggleStopButton(false);
  }

  scrollToBottom();
};

// Fungsi saat form dikirim

const handlerSubmit = (e) => {
  e.preventDefault();
  userMessage = PromptInput.value.trim();
  if (!userMessage) return;

  // Tampilkan pesan user
  const userMsgDiv = createMsgElement(userMessage, "user-message");
  ChatContainer.appendChild(userMsgDiv);
  scrollToBottom();

  // Kosongkan input
  PromptInput.value = "";

  const sensorResponse = getSensorResponse(userMessage);
  if (sensorResponse) {
    const botLoadingDiv = createMsgElement(
      `Mengambil data sensor...`,
      "bot-message",
      true
    );
    ChatContainer.appendChild(botLoadingDiv);
    scrollToBottom();

    setTimeout(() => {
      // Validasi jika data sensor "--"
      if (sensorResponse.includes("--")) {
        botLoadingDiv.querySelector(".pesan-text").innerHTML =
          "Sensor sedang tidak aktif atau terputus.🥲";
      } else {
        botLoadingDiv.querySelector(".pesan-text").innerHTML = sensorResponse;
      }
      scrollToBottom();
    }, 2000);
    return;
  }

  // Tambahkan elemen loading untuk bot dengan ikon Gemini
  const botLoadingDiv = createMsgElement(`Hmmm🤖...`,"bot-message",true);
  ChatContainer.appendChild(botLoadingDiv);

  setTimeout(() => {
    generateResponse(botLoadingDiv);
  }, 2000);
};


// Fungsi menghentikan respons AI
const stopResponse = () => {
  stopTyping = true;
};

// Event listener untuk form dan tombol stop
PromptForm.addEventListener("submit", handlerSubmit);
StopButton.addEventListener("click", stopResponse);

// fungsi menhapus semua chat
deleteButton.addEventListener("click", () => {
  ChatContainer.innerHTML = "";
});

// Dark-mode cerah - gelap 
LightMode.addEventListener("click", () => {
  const ModeDark = document.body.classList.toggle("tema-color")
  localStorage.setItem("themeColor", ModeDark ? "light_mode":"dark_mode");
  LightMode.textContent = ModeDark ? "dark_mode" : "light_mode";
});

const ModeDark = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("tema-color", ModeDark);
LightMode.textContent = ModeDark ? "dark_mode" : "light_mode";


// VOICE 



// === VOICE INPUT CONFIG ===

// Tes ucap
// document.querySelector("#checkbox").addEventListener("change", (e) => {
//   if (e.target.checked) {
//     const dummyText = "Selamat datang, suara ini dari iFLYTEK";
//     speakWithIFlytek(dummyText);
//   }
// });


const checkbox = document.getElementById("checkbox");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "id-ID";
recognition.interimResults = false;

// Load suara saat awal
speechSynthesis.getVoices();
speechSynthesis.onvoiceschanged = () => {};


// checkbox.addEventListener("change", async () => {
//   if (checkbox.checked) {
//     console.log("🎤 Voice mode ON: Memeriksa izin mikrofon...");

//     try {
//       // Langsung minta izin audio (harus dipicu oleh klik/aksi user)
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       stream.getTracks().forEach((track) => track.stop()); // Stop setelah dapat izin

//       // Jalankan recognition setelah izin diberikan
//       recognition.start();
//       console.log("🎙️ Mikrofon aktif...");
//     } catch (err) {
//       console.error("❌ Mikrofon tidak tersedia atau ditolak:", err);

//       alert(
//         "❌ Akses mikrofon ditolak. Pastikan Anda mengizinkan akses mikrofon saat diminta.\n\n" +
//           "👉 Jika tidak muncul pop-up izin, buka pengaturan browser > Setelan situs > Mikrofon > izinkan untuk situs ini."
//       );
//       checkbox.checked = false;
//     }
//   } else {
//     console.log("🔇 Voice mode OFF");
//     recognition.stop();
//   }
// });

// 🔹 Fungsi untuk membersihkan karakter aneh
function cleanText(text) {
  return text
    .replace(/^\*+\s*/gm, "") // Hapus asterisk (bullet) di awal baris
    .replace(/\*+\s*$/gm, "") // Hapus asterisk di akhir baris
    .replace(/\*\*(.*?)\*\*/g, "$1") // Hapus penanda markdown bold
    .replace(/\n{2,}/g, "\n")
    .replace(/\*/g, "")       // Hapus semua tanda asterisk
    .replace(/\n{2,}/g, "\n")   // Hapus newline berlebihan // Hapus newline berlebihan
    .trim(); // Hapus spasi di awal dan akhir
}

checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    console.log("🎤 Voice mode ON: Mulai mendengarkan...");
    // checkMicrophonePermission();
    recognition.start();
  } else {
    console.log("🔇 Voice mode OFF");
    recognition.stop();
  }
});

recognition.onstart = () => {
  console.log("🎙️ Mikrofon aktif...");
};

recognition.onresult = async (event) => {
  const voiceText = event.results[0][0].transcript;
  console.log("🗣️ Suara dikenali:", voiceText);

  // Cek apakah pertanyaan tentang sensor
  const sensorResponse = getSensorResponse(voiceText);
  if (sensorResponse) {
    setTimeout(() => {
      let responseText;
      if (sensorResponse.includes("--")) {
        responseText =
          "Sensor sedang tidak aktif atau terputus.🥲";
      } else {
        responseText = sensorResponse;
      }
      // Untuk suara, hilangkan tag HTML
      const cleaned = responseText.replace(/<[^>]+>/g, "");
      const voices = speechSynthesis.getVoices();
      const googleVoice = voices.find(
        (v) => v.name.includes("Google") && v.lang === "id-ID"
      );
      speakInChunks(cleaned, googleVoice || null);
    }, 2000);
  
  }
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: voiceText }] }],
      }),
    });

    const result = await response.json();
    const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (replyText) {
      console.log("💬 Jawaban Gemini:", replyText);
      const cleaned = cleanText(replyText);
      const voices = speechSynthesis.getVoices();
      const googleVoice = voices.find(
        (v) => v.name.includes("Google") && v.lang === "id-ID"
      );

      speakInChunks(cleaned, googleVoice || null);
    } else {
      console.warn("⚠️ Jawaban dari Gemini kosong atau tidak terdeteksi.");
    }
  } catch (error) {
    console.error("❌ Gagal memproses ke Gemini API:", error);
  }

  checkbox.checked = false;
};

recognition.onerror = (event) => {
  console.error("❌ Error voice input:", event.error);
  checkbox.checked = false;
};

recognition.onend = () => {
  console.log("🎧 Perekaman selesai.");
};



// 🔹 Fungsi bicara terpotong agar suara tidak putus
function speakInChunks(text, voice = null) {
  const maxChunkLength = 200;
  const chunks = text.match(
    new RegExp(`(.|[\r\n]){1,${maxChunkLength}}([.!?]\\s|$)`, "g")
  );

  if (!chunks) return;

  const speakNext = (index) => {
    if (index >= chunks.length) return;

    const utterance = new SpeechSynthesisUtterance(chunks[index].trim());
    utterance.lang = "id-ID";
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    if (voice) utterance.voice = voice;

    utterance.onerror = (e) => {
      console.warn("⚠️ Error saat membacakan:", e.error);
    };

    utterance.onend = () => {
      speakNext(index + 1);
    };

    speechSynthesis.speak(utterance);
  };

  speakNext(0);
}


// Sensor ESP32
// Fungsi untuk mengupdate nilai sensor di halaman
let lastSensorData = {
  temperature: "--",
  humidity: "--",
  gas: "--",
  status: "--",
  ldr: "--",
};

function updateSensorValues(data) {
    document.getElementById('temperature').textContent = data.temperature;
    document.getElementById('humidity').textContent = data.humidity;
    document.getElementById('gas').textContent = data.gas;
    document.getElementById('status').textContent = data.status;
    document.getElementById('ldr').textContent = data.ldr;
}


async function fetchSensorData() {
    try {
        const response = await fetch('http://192.168.43.201/data');
        const data = await response.json();
        updateSensorValues(data);
    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}
// Update sensor values every 2 seconds
setInterval(fetchSensorData, 2000);

// Initial fetch when page loads
fetchSensorData();

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Deteksi pertanyaan sensor dan buat respon khusus
function getSensorResponse(text) {
  const tanya = text.toLowerCase();
  const time = getCurrentTime();

  if (tanya.includes("suhu") || tanya.includes("temperature")) {
    return `Suhu ruangan saat ini pada ${time} adalah <b>${lastSensorData.temperature}°C</b>.`;
  }
  if (tanya.includes("kelembapan") || tanya.includes("humidity")) {
    return `Kelembapan ruangan saat ini pada ${time} adalah <b>${lastSensorData.humidity}%</b>.`;
  }
  if (
    (tanya.includes("gas") && !tanya.includes("status")) ||
    tanya.includes("kadar gas")
  ) {
    return `Kadar gas terdeteksi pada ${time} adalah <b>${lastSensorData.gas}</b>.`;
  }
  if (tanya.includes("status gas")) {
    return `Status gas pada ${time}: <b>${lastSensorData.status}</b>.`;
  }
  if (
    tanya.includes("ldr") ||
    tanya.includes("cahaya") ||
    tanya.includes("light")
  ) {
    return `Nilai sensor cahaya (LDR) pada ${time} adalah <b>${lastSensorData.ldr}</b>.`;
  }
  // Jika ingin menampilkan semua data sensor
  if (
    tanya.includes("semua sensor") ||
    tanya.includes("data sensor") ||
    tanya.includes("sensor lengkap")
  ) {
    return `
            Data sensor pada ${time}:<br>
            • Suhu: <b>${lastSensorData.temperature}°C</b><br>
            • Kelembapan: <b>${lastSensorData.humidity}%</b><br>
            • Gas: <b>${lastSensorData.gas}</b><br>
            • Status Gas: <b>${lastSensorData.status}</b><br>
            • LDR: <b>${lastSensorData.ldr}</b>
        `;
  }
  return null;
}



