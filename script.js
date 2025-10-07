const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const skinResult = document.getElementById("skinResult");
const result = document.getElementById("result");

let detectedSkin = null;
let faceMesh;
let landmarks = null;
let frameCount = 0;
let avgR = 0, avgG = 0, avgB = 0;

// Inisialisasi MediaPipe Face Mesh
async function initFaceMesh() {
  faceMesh = new FaceMesh.FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults(onFaceMeshResults);
}

// Mulai kamera
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
  });
  video.srcObject = stream;
  video.play();
  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    initFaceMesh();
    detectFrame();
  };
}

// Deteksi frame
function detectFrame() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  faceMesh.send({ image: canvas });
  requestAnimationFrame(detectFrame);
}

// Callback saat face mesh mendeteksi wajah
function onFaceMeshResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

  landmarks = results.multiFaceLandmarks[0];

  // Ambil warna kulit dari area tertentu
  const areas = [
    [33, 133], [263, 362], [1, 61], [291, 417], [199, 429], [5, 285], [249, 354], [152, 389]
  ];

  let r = 0, g = 0, b = 0, count = 0;
  areas.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    const x = Math.floor((start.x + end.x) / 2 * canvas.width);
    const y = Math.floor((start.y + end.y) / 2 * canvas.height);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    r += pixel[0];
    g += pixel[1];
    b += pixel[2];
    count++;
  });

  r = r / count;
  g = g / count;
  b = b / count;

  // Hitung rata-rata warna dari beberapa frame
  avgR = (avgR * frameCount + r) / (frameCount + 1);
  avgG = (avgG * frameCount + g) / (frameCount + 1);
  avgB = (avgB * frameCount + b) / (frameCount + 1);
  frameCount++;

  // Tentukan jenis warna kulit
  const brightness = (avgR + avgG + avgB) / 3;
  let skinType;
  if (brightness > 200) {
    skinType = "terang";
  } else if (brightness > 100) {
    skinType = "sawo";
  } else {
    skinType = "gelap";
  }

  // Tampilkan hasil jika berubah
  if (skinType !== detectedSkin) {
    detectedSkin = skinType;
    showResults(Math.round(avgR), Math.round(avgG), Math.round(avgB), skinType);
  }
}

// Tampilkan hasil deteksi
function showResults(r, g, b, skinType) {
  let fashion = "", brand = "", makeup = "";

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

// Mulai aplikasi
startCamera();
