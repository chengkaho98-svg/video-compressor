// ============================================
// GLOBAL VARIABLES
// ============================================

let videoFile = null;
let currentJobId = null;
let pollInterval = null;

// Compression presets
const PRESETS = {
  'high': { scale: '1920:-2', crf: 23, label: 'High Quality' },
  'medium': { scale: '1280:-2', crf: 28, label: 'Medium Quality' },
  'low': { scale: '854:-2', crf: 32, label: 'Low Quality' },
  'very-low': { scale: '640:-2', crf: 35, label: 'Very Low Quality' }
};

const CODECS = {
  h264: { lib: 'libx264', ext: 'mp4', crf: true },
  vp9: { lib: 'libvpx-vp9', ext: 'webm', crf: true }
};

// State variables
let selectedPreset = 'medium';
let selectedCodec = 'h264';
let compressionMode = 'quality'; // 'quality' or 'target'
let targetSize = 50; // MB - matches HTML default
let videoDuration = 0;

// API Base URL
const API_BASE = 'http://localhost:3000';

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  // File input
  fileInput: document.getElementById('fileInput'),
  uploadZone: document.getElementById('uploadZone'),
  fileInfo: document.getElementById('fileInfo'),
  fileName: document.getElementById('fileName'),
  fileSize: document.getElementById('fileSize'),
  changeFileBtn: document.getElementById('changeFileBtn'),

  // Settings
  settingsPanel: document.getElementById('settingsPanel'),
  presetButtons: document.querySelectorAll('.preset-btn'),
  codecSelect: document.getElementById('codecSelect'),
  modeToggle: document.getElementById('modeToggle'),
  qualityModeBtn: document.getElementById('modeQuality'),
  targetModeBtn: document.getElementById('modeTargetSize'),
  qualitySettings: document.getElementById('qualityModeContent'),
  targetSettings: document.getElementById('targetSizeModeContent'),
  targetSizeInput: document.getElementById('targetSizeInput'),
  compressBtn: document.getElementById('compressBtn'),

  // Progress
  progressSection: document.getElementById('progressSection'),
  progressBar: document.getElementById('progressBar'),
  progressValue: document.getElementById('progressPercentage'),
  progressStatus: document.getElementById('progressStatus'),

  // Results
  resultsSection: document.getElementById('resultsSection'),
  originalSize: document.getElementById('originalSize'),
  compressedSize: document.getElementById('compressedSize'),
  savedSize: document.getElementById('savedSize'),
  savingsPercentage: document.getElementById('savingsPercentage'),
  downloadBtn: document.getElementById('downloadBtn'),
  compressAnotherBtn: document.getElementById('compressAnotherBtn')
};

console.log('Video Compressor initialized!');
console.log('Backend API:', API_BASE);

// ============================================
// EVENT LISTENERS
// ============================================

// File selection
elements.fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFileSelect(file);
});

elements.uploadZone.addEventListener('click', () => {
  elements.fileInput.click();
});

elements.uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  elements.uploadZone.classList.add('drag-over');
});

elements.uploadZone.addEventListener('dragleave', () => {
  elements.uploadZone.classList.remove('drag-over');
});

elements.uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  elements.uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

elements.changeFileBtn.addEventListener('click', () => {
  elements.fileInput.click();
});

// Preset selection
elements.presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    elements.presetButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPreset = btn.dataset.preset;
  });
});

// Codec selection
elements.codecSelect.addEventListener('change', (e) => {
  selectedCodec = e.target.value;
});

// Compression mode
elements.qualityModeBtn.addEventListener('click', () => {
  compressionMode = 'quality';
  elements.qualityModeBtn.classList.add('active');
  elements.targetModeBtn.classList.remove('active');
  elements.qualitySettings.style.display = 'block';
  elements.targetSettings.style.display = 'none';
});

elements.targetModeBtn.addEventListener('click', () => {
  compressionMode = 'target';
  elements.targetModeBtn.classList.add('active');
  elements.qualityModeBtn.classList.remove('active');
  elements.qualitySettings.style.display = 'none';
  elements.targetSettings.style.display = 'block';
});

elements.targetSizeInput.addEventListener('input', (e) => {
  targetSize = parseInt(e.target.value) || 10;
});

// Compress button
elements.compressBtn.addEventListener('click', compressVideo);

// Download button
elements.downloadBtn.addEventListener('click', downloadCompressedVideo);

// Compress another
elements.compressAnotherBtn.addEventListener('click', resetApp);

// ============================================
// FILE HANDLING
// ============================================

async function handleFileSelect(file) {
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('video/')) {
    alert('Please select a valid video file.');
    return;
  }

  // Store the file
  videoFile = file;

  // Get video duration
  await getVideoDuration(file);

  // Update UI
  elements.fileName.textContent = file.name;
  elements.fileSize.textContent = formatFileSize(file.size);

  elements.uploadZone.style.display = 'none';
  elements.fileInfo.classList.add('active');
  elements.settingsPanel.classList.add('active');

  // Reset previous results
  elements.resultsSection.classList.remove('active');
}

async function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      videoDuration = video.duration;
      console.log(`Video duration: ${videoDuration} seconds`);
      resolve();
    };

    video.src = URL.createObjectURL(file);
  });
}

// ============================================
// COMPRESSION
// ============================================

async function compressVideo() {
  if (!videoFile) {
    alert('Please select a video file first.');
    return;
  }

  try {
    // Step 1: Upload file
    elements.settingsPanel.classList.remove('active');
    elements.progressSection.classList.add('active');
    updateProgress(0);
    elements.progressStatus.textContent = 'Uploading video to server...';

    const uploadedJob = await uploadVideo(videoFile);
    currentJobId = uploadedJob.jobId;

    console.log('Upload complete. Job ID:', currentJobId);

    // Step 2: Start compression
    elements.progressStatus.textContent = 'Starting compression...';
    updateProgress(5);

    const compressionParams = {
      codec: selectedCodec,
      mode: compressionMode,
      preset: selectedPreset
    };

    if (compressionMode === 'quality') {
      compressionParams.quality = PRESETS[selectedPreset].crf;
    } else {
      compressionParams.targetSize = targetSize;
    }

    await startCompression(currentJobId, compressionParams);

    // Step 3: Poll for progress
    elements.progressStatus.textContent = 'Compressing video...';
    pollProgress();

  } catch (error) {
    console.error('Compression error:', error);
    alert('Failed to compress video: ' + error.message);
    elements.progressSection.classList.remove('active');
    elements.settingsPanel.classList.add('active');
  }
}

async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json();
}

async function startCompression(jobId, params) {
  const response = await fetch(`${API_BASE}/compress/${jobId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to start compression');
  }

  return await response.json();
}

function pollProgress() {
  pollInterval = setInterval(async () => {
    try {
      const status = await getJobStatus(currentJobId);

      updateProgress(status.progress);

      if (status.status === 'completed') {
        clearInterval(pollInterval);
        showResults(status);
      } else if (status.status === 'error') {
        clearInterval(pollInterval);
        throw new Error(status.error || 'Compression failed');
      }
    } catch (error) {
      clearInterval(pollInterval);
      console.error('Status check error:', error);
      alert('Failed to check compression status: ' + error.message);
    }
  }, 500); // Poll every 500ms
}

async function getJobStatus(jobId) {
  const response = await fetch(`${API_BASE}/status/${jobId}`);

  if (!response.ok) {
    throw new Error('Failed to get status');
  }

  return await response.json();
}

function updateProgress(percentage) {
  elements.progressValue.textContent = `${percentage}%`;
  elements.progressBar.style.width = `${percentage}%`;
}

function showResults(status) {
  elements.progressSection.classList.remove('active');
  elements.resultsSection.classList.add('active');

  elements.originalSize.textContent = formatFileSize(status.originalSize);
  elements.compressedSize.textContent = formatFileSize(status.compressedSize);

  const savedBytes = status.originalSize - status.compressedSize;
  const ratio = ((savedBytes / status.originalSize) * 100).toFixed(1);

  elements.savedSize.textContent = formatFileSize(savedBytes);
  elements.savingsPercentage.textContent = `${ratio}% smaller`;

  console.log('Compression complete!');
}

async function downloadCompressedVideo() {
  if (!currentJobId) return;

  const downloadUrl = `${API_BASE}/download/${currentJobId}`;
  window.open(downloadUrl, '_blank');
}

function resetApp() {
  // Clear state
  videoFile = null;
  currentJobId = null;
  if (pollInterval) clearInterval(pollInterval);

  // Reset UI
  elements.fileInput.value = '';
  elements.fileInfo.classList.remove('active');
  elements.settingsPanel.classList.remove('active');
  elements.progressSection.classList.remove('active');
  elements.resultsSection.classList.remove('active');
  elements.uploadZone.style.display = 'flex';

  // Reset progress
  updateProgress(0);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
