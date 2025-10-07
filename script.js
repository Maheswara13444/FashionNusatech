const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const skinResult = document.getElementById("skinResult");
const result = document.getElementById("result");

let detectedSkin = null;

// Aktifkan kamera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play();
    startAutoDetection();
  })
  .catch(error => {
    alert("Tidak dapat mengakses kamera: " + error.message);
  });

// Deteksi otomatis setiap 2 detik
function startAutoDetection() {
  setInterval(() => detectSkin(), 2000);
}

function detectSkin() {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Ambil area kecil dari tengah wajah
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

  // 🔹 Tentukan warna kulit berdasarkan rasio warna (tanpa menyesuaikan pencahayaan)
  let skinType;
  if (r > g && g > b && r / g < 1.3 && g / b > 1.2) {
    skinType = "sawo"; // tone medium
  } else if (r > g && g > b && r / g > 1.3) {
    skinType = "terang"; // tone cerah
  } else {
    skinType = "gelap"; // tone gelap
  }

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
    makeup = "Gunakan tone hangat seperti peach atau coral.";
    fashion = "Coba warna pastel dan lembut.";
    brand = "Uniqlo atau H&M.";
  } else if (skinType === "sawo") {
    makeup = "Gunakan warna natural seperti nude atau gold.";
    fashion = "Coba warna earthy seperti coklat, olive, dan beige.";
    brand = "Zara atau Pull & Bear.";
  } else {
    makeup = "Gunakan warna bold seperti merah maroon atau bronze.";
    fashion = "Warna kontras seperti putih atau merah.";
    brand = "Cotton On atau Marks & Spencer.";
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
