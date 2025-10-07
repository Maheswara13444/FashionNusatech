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
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      video.srcObject = stream;
      video.play();
      video.onloadedmetadata = () => setTimeout(startAutoDetection, 1500);
    })
    .catch(err => alert("Tidak dapat mengakses kamera: " + err.message));
}

function startAutoDetection() {
  setInterval(detectSkin, 2000);
}

function detectSkin() {
  const ctx = canvas.getContext("2d");
  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Ambil beberapa area tengah wajah
  const areas = [
    {x: canvas.width/2 - 50, y: canvas.height/2 - 50, w: 100, h: 100},
    {x: canvas.width/2 - 30, y: canvas.height/2 - 80, w: 60, h: 60},
    {x: canvas.width/2 - 40, y: canvas.height/2 - 20, w: 80, h: 80}
  ];

  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  areas.forEach(a => {
    const frame = ctx.getImageData(a.x, a.y, a.w, a.h);
    const data = frame.data;
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i+1];
      totalB += data[i+2];
      count++;
    }
  });

  let r = totalR / count;
  let g = totalG / count;
  let b = totalB / count;

  // Konversi RGB ke HSV
  const [h, s, v] = rgbToHsv(r, g, b);

  let skinType;
  if (v > 0.7 && s < 0.4) skinType = "terang";     
  else if (v > 0.4 && v <= 0.7 && s >= 0.2) skinType = "sawo";
  else skinType = "gelap";

  if (skinType !== detectedSkin) {
    detectedSkin = skinType;
    showResults(Math.round(r), Math.round(g), Math.round(b), skinType);
  }
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if(d === 0) h = 0;
  else {
    switch(max) {
      case r: h = (g - b)/d + (g < b ? 6 : 0); break;
      case g: h = (b - r)/d + 2; break;
      case b: h = (r - g)/d + 4; break;
    }
    h /= 6;
  }
  return [h*360, s, v];
}

function showResults(r, g, b, skinType) {
  let fashion="", brand="", makeup="";

  if(skinType === "terang"){
    makeup = "Gunakan tone hangat seperti peach atau coral untuk kesan segar.";
    fashion = "Coba warna pastel dan lembut, cocok untuk tampil feminin.";
    brand = "Cocok dengan brand seperti Uniqlo atau H&M.";
  } else if(skinType === "sawo"){
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
