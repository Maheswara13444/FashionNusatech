const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const skinResult = document.getElementById("skinResult");
const result = document.getElementById("result");

let detectedSkin = null;

// Aktifkan kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    startAutoDetection();
  })
  .catch(error => {
    alert("Tidak dapat mengakses kamera: " + error.message);
  });

// Fungsi utama: deteksi otomatis setiap 2 detik
function startAutoDetection() {
  setInterval(() => {
    detectSkin();
  }, 2000);
}

function detectSkin() {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Ambil area kecil dari tengah wajah (anggap tengah video = wajah user)
  const frame = ctx.getImageData(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100);
  const data = frame.data;

  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  const pixelCount = data.length / 4;
  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  // Tentukan warna kulit berdasarkan rata-rata RGB
  let skinType;
  if (r > 200 && g > 170 && b > 150) {
    skinType = "terang";
  } else if (r > 140 && g > 100 && b < 80) {
    skinType = "sawo";
  } else {
    skinType = "gelap";
  }

  // Jika berubah, tampilkan hasil baru
  if (skinType !== detectedSkin) {
    detectedSkin = skinType;
    showResults(r, g, b, skinType);
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
