// Voxtral Web App - Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // Load API configuration
    if (window.APP_CONFIG) {
        document.getElementById('api-info').innerHTML = `
            <div class="url-display">
                <strong>API URL:</strong> <span id="api-url">${window.APP_CONFIG.API_URL}</span>
            </div>
        `;
        
        document.getElementById('last-update').textContent = window.APP_CONFIG.LAST_UPDATE;
        
        console.log('App config loaded:', window.APP_CONFIG);
    } else {
        document.getElementById('api-info').innerHTML = '<p class="status-message status-error">Error: Could not load API configuration</p>';
        document.getElementById('last-update').textContent = 'Configuration not loaded';
    }
    
    // Set up file upload functionality
    setupFileUpload();
    
    // Auto-refresh configuration periodically
    setInterval(updateConfigDisplay, 30000); // Refresh every 30 seconds
});

function updateConfigDisplay() {
    // In a real app, this would fetch the latest config from the server
    // For now, we'll just log that the refresh happened
    console.log('Checking for configuration updates...');
    if (window.APP_CONFIG) {
        document.getElementById('last-update').textContent = new Date().toLocaleString();
    }
}

function setupFileUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const fileList = document.getElementById('file-list');
    const statusDiv = document.getElementById('upload-status');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    
    // Click to browse files
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', handleFiles);
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = e.target.files || e.dataTransfer.files;
        if (files.length > 0) {
            showStatus(`Selected ${files.length} file(s)`, 'success');
            displayFiles(files);
            
            // Process each file
            Array.from(files).forEach(file => {
                uploadFile(file);
            });
        }
    }
    
    function displayFiles(files) {
        fileList.innerHTML = '';
        Array.from(files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <div class="file-actions">
                    <button class="action-btn view-btn" data-index="${index}">View</button>
                    <button class="action-btn upload-btn" data-index="${index}">Upload</button>
                </div>
            `;
            fileList.appendChild(fileItem);
        });
    }
    
    function uploadFile(file) {
        // Show progress bar
        progressContainer.style.display = 'block';
        
        // Simulate upload progress
        simulateUploadProgress(file);
    }
    
    function simulateUploadProgress(file) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Hide progress bar after completion
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                }, 1000);
                
                showStatus(`Successfully uploaded: ${file.name}`, 'success');
            }
            
            progressBar.style.width = `${progress}%`;
        }, 200);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status-message status-${type}`;
        statusDiv.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
}

// Utility function to fetch data from the API
async function fetchDataFromAPI(endpoint) {
    if (!window.APP_CONFIG || !window.APP_CONFIG.API_URL) {
        console.error('API configuration not loaded');
        return null;
    }
    
    try {
        const response = await fetch(`${window.APP_CONFIG.API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return null;
    }
}

// Utility function to send data to the API
async function sendDataToAPI(endpoint, data, method = 'POST') {
    if (!window.APP_CONFIG || !window.APP_CONFIG.API_URL) {
        console.error('API configuration not loaded');
        return null;
    }
    
    try {
        const response = await fetch(`${window.APP_CONFIG.API_URL}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error sending data to API:', error);
        return null;
    }
}