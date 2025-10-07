const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const skinResult = document.getElementById("skinResult");
const result = document.getElementById("result");

let detectedSkin = null;

// 🧩 Cek dukungan kamera
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert("Browser kamu tidak mendukung akses kamera.");
} else {
  startCamera();
}

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "user" // gunakan kamera depan di HP
      },
    })
    .then(stream => {
      video.srcObject = stream;
      video.play();

      // Safari butuh sedikit delay agar video siap
      video.onloadedmetadata = () => {
        setTimeout(startAutoDetection, 1500);
      };
    })
    .catch(error => {
      alert("Tidak dapat mengakses kamera: " + error.message);
    });
}

// 🔁 Deteksi otomatis setiap 2 detik
function startAutoDetection() {
  setInterval(() => detectSkin(), 2000);
}

function detectSkin() {
  const ctx = canvas.getContext("2d");

  // Pastikan video sudah aktif
  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Gambar frame video ke canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Ambil area tengah (anggap wajah berada di tengah)
  const frame = ctx.getImageData(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100);
  const data = frame.data;

  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  const pixelCount = data.length / 4;
  r = r / pixelCount;
  g = g / pixelCount;
  b = b / pixelCount;

  // 🌈 Normalisasi warna berdasarkan kecerahan (agar tidak salah karena pencahayaan)
  const brightness = (r + g + b) / 3;
  const normR = (r / brightness) * 128;
  const normG = (g / brightness) * 128;
  const normB = (b / brightness) * 128;

  // 🎯 Tentukan warna kulit berdasar rasio warna, bukan kecerahan mentah
  let skinType;
  if (normR > 150 && normG > 140) {
    skinType = "terang";
  } else if (normR > normG + 10 && normB < normR - 20) {
    skinType = "sawo";
  } else {
    skinType = "gelap";
  }

  // Jika hasil baru berbeda, tampilkan hasil
  if (skinType !== detectedSkin) {
    detectedSkin = skinType;
    showResults(Math.round(r), Math.round(g), Math.round(b), skinType);
  }
}

function showResults(r, g, b, skinType) {
  let fashion = "";
  let brand = "";
  let makeup = "";

  if (skinType === "terang") {
    makeup = "Gunakan tone hangat seperti peach atau coral untuk kesan segar.";
    fashion = "Coba warna pastel dan lembut, cocok untuk tampil feminin.";
    brand = "Cocok dengan brand seperti Uniqlo atau H&M.";
  } else if (skinType === "sawo") {
    makeup = "Gunakan warna natural seperti nude atau gold.";
    fashion = "Coba warna earthy seperti coklat, olive, dan beige.";
    brand = "Cocok dengan brand seperti Zara atau Pull & Bear.";
  } else {
    makeup = "Gunakan warna bold seperti merah maroon atau bronze agar menonjol.";
    fashion = "Warna cerah dan kontras seperti putih atau merah cocok untuk kamu.";
    brand = "Cocok dengan brand seperti Cotton On atau Marks & Spencer.";
  }

  skinResult.innerHTML = `
    <h3>🎨 Warna Kulit Terdeteksi:</h3>
    <p><b>${skinType.toUpperCase()}</b></p>
    <div class="color-box" style="background-color: rgb(${r}, ${g}, ${b});"></div>
  `;

  result.innerHTML = `
    <h3>💡 Rekomendasi Fashion & Makeup</h3>
    <p><b>Fashion:</b> ${fashion}</p>
    <p><b>Brand:</b> ${brand}</p>
    <p><b>Makeup:</b> ${makeup}</p>
  `;
}
