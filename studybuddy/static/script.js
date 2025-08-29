// Add this to the beginning of your script.js file
// Fix for Django static file loading
function getStaticUrl(path) {
    // This will work with Django's static template tag
    return path;
}

// Global variables
let webcamStream = null;
let timerInterval = null;
let isFullscreenCamera = false;
let currentTimer = {
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isRunning: false,
    isPaused: false
};

// DOM elements (will be initialized per page)
let allowCameraBtn, cameraIcon, webcamPreview, webcamText, aiDescription;
let sessionBtn, dropdownMenu, pomodoroOpts, startPomodoroBtn;
let timerModal, closeTimer, fullscreenTimerOption, cameraTimerOption;
let fullscreenTimerOverlay, cameraTimerOverlay, timerWebcam;
let timeLeft, timerLabel, pauseBtn, stopBtn, progressBar;
let overlayTime, overlayLabel, pauseBtnCamera, stopBtnCamera, progressBarCamera;

// Initialize the application
function initApp() {
    // Initialize DOM elements based on current page
    initializeDOMElements();
    
    setupNavigation();
    setupTodoList();
    
    // Only setup camera and timer on dashboard page
    if (isDashboardPage()) {
        setupCamera();
        setupPomodoro();
        setupTimerControls();
        createFullscreenCameraModal();
    }
    
    // Setup page-specific functionality
    if (isTasksPage()) {
        setupTasks();
    }
    
    if (isLeaderboardPage()) {
        setupLeaderboard();
    }
}

// Check which page we're on
function isDashboardPage() {
    return window.location.pathname === '/' || window.location.pathname.includes('dashboard');
}

function isTasksPage() {
    return window.location.pathname.includes('tasks');
}

function isLeaderboardPage() {
    return window.location.pathname.includes('leaderboard');
}

function isInsightsPage() {
    return window.location.pathname.includes('insights');
}

// Initialize DOM elements safely
function initializeDOMElements() {
    // Camera elements (dashboard only)
    allowCameraBtn = document.querySelector('.allow-camera-btn');
    cameraIcon = document.getElementById('cameraIcon');
    webcamPreview = document.getElementById('webcamPreview');
    webcamText = document.querySelector('.webcam-text');
    aiDescription = document.querySelector('.ai-description');
    
    // Timer elements (dashboard only)
    sessionBtn = document.getElementById('startSessionBtn');
    dropdownMenu = document.getElementById('pomodoroDropdown');
    pomodoroOpts = document.querySelectorAll('.pomodoro-option');
    startPomodoroBtn = document.getElementById('startPomodoroBtn');
    
    // Timer modal elements
    timerModal = document.getElementById('timerModal');
    closeTimer = document.getElementById('closeTimer');
    fullscreenTimerOption = document.getElementById('fullscreenTimer');
    cameraTimerOption = document.getElementById('cameraTimer');
    
    // Timer overlay elements
    fullscreenTimerOverlay = document.getElementById('fullscreenTimerOverlay');
    cameraTimerOverlay = document.getElementById('cameraTimerOverlay');
    timerWebcam = document.getElementById('timerWebcam');
    
    // Timer control elements
    timeLeft = document.getElementById('timeLeft');
    timerLabel = document.getElementById('timerLabel');
    pauseBtn = document.getElementById('pauseBtn');
    stopBtn = document.getElementById('stopBtn');
    progressBar = document.getElementById('progressBar');
    
    overlayTime = document.getElementById('overlayTime');
    overlayLabel = document.getElementById('overlayLabel');
    pauseBtnCamera = document.getElementById('pauseBtnCamera');
    stopBtnCamera = document.getElementById('stopBtnCamera');
    progressBarCamera = document.getElementById('progressBarCamera');
}

// Set up navigation functionality
function setupNavigation() {
    // This will be handled by navigation.js
}

// Create fullscreen camera modal
function createFullscreenCameraModal() {
    // Only create if it doesn't exist
    if (document.getElementById('fullscreenCameraModal')) return;
    
    const fullscreenCameraModal = document.createElement('div');
    fullscreenCameraModal.id = 'fullscreenCameraModal';
    fullscreenCameraModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 3000;
        display: none;
        align-items: center;
        justify-content: center;
    `;
    
    const fullscreenCameraContainer = document.createElement('div');
    fullscreenCameraContainer.style.cssText = `
        position: relative;
        width: 90%;
        height: 90%;
        max-width: 1200px;
        max-height: 800px;
    `;
    
    const fullscreenVideo = document.createElement('video');
    fullscreenVideo.id = 'fullscreenCameraVideo';
    fullscreenVideo.autoplay = true;
    fullscreenVideo.muted = true;
    fullscreenVideo.playsInline = true;
    fullscreenVideo.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
    `;
    
    const closeFullscreenBtn = document.createElement('button');
    closeFullscreenBtn.innerHTML = '×';
    closeFullscreenBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;
    
    fullscreenCameraContainer.appendChild(fullscreenVideo);
    fullscreenCameraContainer.appendChild(closeFullscreenBtn);
    fullscreenCameraModal.appendChild(fullscreenCameraContainer);
    document.body.appendChild(fullscreenCameraModal);
    
    // Close fullscreen camera when clicking close button or outside
    closeFullscreenBtn.addEventListener('click', closeFullscreenCamera);
    fullscreenCameraModal.addEventListener('click', function(e) {
        if (e.target === fullscreenCameraModal) {
            closeFullscreenCamera();
        }
    });
    
    // ESC key to close fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreenCamera) {
            closeFullscreenCamera();
        }
    });
}

// Open fullscreen camera view
function openFullscreenCamera() {
    if (!webcamStream) {
        alert('Please enable camera access first!');
        return;
    }
    
    const fullscreenCameraModal = document.getElementById('fullscreenCameraModal');
    const fullscreenVideo = document.getElementById('fullscreenCameraVideo');
    
    if (fullscreenCameraModal && fullscreenVideo) {
        fullscreenVideo.srcObject = webcamStream;
        fullscreenCameraModal.style.display = 'flex';
        isFullscreenCamera = true;
    }
}

// Close fullscreen camera view
function closeFullscreenCamera() {
    const fullscreenCameraModal = document.getElementById('fullscreenCameraModal');
    if (fullscreenCameraModal) {
        fullscreenCameraModal.style.display = 'none';
        isFullscreenCamera = false;
    }
}

// Set up todo list functionality
function setupTodoList() {
    const todoCheckboxes = document.querySelectorAll('.todo-checkbox');
    
    // Set up initial states for any pre-checked items
    todoCheckboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            const todoText = checkbox.nextElementSibling;
            if (todoText) {
                todoText.style.textDecoration = 'line-through';
                todoText.style.color = '#9ca3af';
            }
        }
        
        // Add change listener
        checkbox.addEventListener('change', function() {
            const todoText = this.nextElementSibling;
            if (todoText) {
                if (this.checked) {
                    todoText.style.textDecoration = 'line-through';
                    todoText.style.color = '#9ca3af';
                } else {
                    todoText.style.textDecoration = 'none';
                    todoText.style.color = '#374151';
                }
            }
        });
    });
}

// Set up camera functionality
function setupCamera() {
    if (allowCameraBtn) {
        allowCameraBtn.addEventListener('click', async function() {
            try {
                // Request webcam access
                webcamStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 }, 
                    audio: false 
                });
                
                // Hide camera icon and button, show video
                if (cameraIcon) cameraIcon.style.display = 'none';
                if (webcamPreview) {
                    webcamPreview.style.display = 'block';
                    webcamPreview.srcObject = webcamStream;
                }
                if (allowCameraBtn) allowCameraBtn.style.display = 'none';
                
                // Remove the CSS transform to fix inverted camera
                if (webcamPreview) webcamPreview.style.transform = 'none';
                
                // Update text and AI description
                if (webcamText) webcamText.textContent = 'Camera active - Analyzing your study habits';
                if (aiDescription) aiDescription.textContent = 'Camera is now active! I can see you\'re ready to study. Your posture looks good and you seem focused. Let\'s start a productive session!';
                
                // Add click event to camera preview for fullscreen
                if (webcamPreview) {
                    webcamPreview.addEventListener('click', openFullscreenCamera);
                    webcamPreview.style.cursor = 'pointer';
                }
                
            } catch (error) {
                console.error('Error accessing webcam:', error);
                alert('Could not access camera. Please make sure you have given permission and no other application is using the camera.');
            }
        });
    }
}

// Set up pomodoro functionality
function setupPomodoro() {
    // Toggle dropdown when clicking start session button
    if (sessionBtn) {
        sessionBtn.addEventListener('click', function() {
            if (dropdownMenu) dropdownMenu.classList.toggle('show');
        });
    }
    
    // Close dropdown if user clicks elsewhere
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-buttons')) {
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        }
    });
    
    // Handle pomodoro option selection
    if (pomodoroOpts && pomodoroOpts.length > 0) {
        pomodoroOpts.forEach(function(option) {
            option.addEventListener('click', function() {
                // Clear all active states first
                pomodoroOpts.forEach(function(opt) {
                    opt.classList.remove('active');
                });
                // Set this one as active
                this.classList.add('active');
            });
        });
    }
    
    // Start the pomodoro session - show timer mode selection
    if (startPomodoroBtn) {
        startPomodoroBtn.addEventListener('click', function() {
            const activeOption = document.querySelector('.pomodoro-option.active');
            if (activeOption) {
                const studyMins = parseInt(activeOption.getAttribute('data-study'));
                const breakMins = parseInt(activeOption.getAttribute('data-break'));
                
                // Set up timer
                currentTimer.minutes = studyMins;
                currentTimer.totalSeconds = studyMins * 60;
                
                // Hide dropdown and show timer modal
                if (dropdownMenu) dropdownMenu.classList.remove('show');
                if (timerModal) timerModal.style.display = 'block';
            } else {
                alert('Please select a session type first!');
            }
        });
    }
}

// Set up timer controls
function setupTimerControls() {
    // Timer modal controls
    if (closeTimer) {
        closeTimer.addEventListener('click', function() {
            if (timerModal) timerModal.style.display = 'none';
        });
    }
    
    // Fullscreen timer option
    if (fullscreenTimerOption) {
        fullscreenTimerOption.addEventListener('click', function() {
            if (timerModal) timerModal.style.display = 'none';
            startFullscreenTimer();
        });
    }
    
    // Camera timer option
    if (cameraTimerOption) {
        cameraTimerOption.addEventListener('click', async function() {
            if (timerModal) timerModal.style.display = 'none';
            await startCameraTimer();
        });
    }
    
    // Timer control event listeners
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => pauseTimer('fullscreen'));
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => stopTimer('fullscreen'));
    }
    
    if (pauseBtnCamera) {
        pauseBtnCamera.addEventListener('click', () => pauseTimer('camera'));
    }
    
    if (stopBtnCamera) {
        stopBtnCamera.addEventListener('click', () => stopTimer('camera'));
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (timerModal && e.target === timerModal) {
            timerModal.style.display = 'none';
        }
    });
    
    // Keyboard shortcuts for timer
    document.addEventListener('keydown', function(e) {
        if (currentTimer.isRunning) {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (fullscreenTimerOverlay && fullscreenTimerOverlay.style.display === 'block') {
                        pauseTimer('fullscreen');
                    } else if (cameraTimerOverlay && cameraTimerOverlay.style.display === 'block') {
                        pauseTimer('camera');
                    }
                    break;
                case 'Escape':
                    if (fullscreenTimerOverlay && fullscreenTimerOverlay.style.display === 'block') {
                        stopTimer('fullscreen');
                    } else if (cameraTimerOverlay && cameraTimerOverlay.style.display === 'block') {
                        stopTimer('camera');
                    }
                    break;
            }
        }
    });
}

// Timer functions
function startFullscreenTimer() {
    if (fullscreenTimerOverlay) {
        fullscreenTimerOverlay.style.display = 'flex';
        initializeTimer('fullscreen');
    }
}

async function startCameraTimer() {
    try {
        // If we don't have webcam access, request it
        if (!webcamStream) {
            webcamStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 1280, height: 720 }, 
                audio: false 
            });
        }
        
        if (timerWebcam) {
            timerWebcam.srcObject = webcamStream;
            // Remove the CSS transform to fix inverted camera in timer view
            timerWebcam.style.transform = 'none';
        }
        if (cameraTimerOverlay) {
            cameraTimerOverlay.style.display = 'block';
        }
        initializeTimer('camera');
    } catch (error) {
        console.error('Error accessing webcam for timer:', error);
        alert('Could not access camera for timer view. Using fullscreen timer instead.');
        startFullscreenTimer();
    }
}

function initializeTimer(mode) {
    currentTimer.seconds = currentTimer.totalSeconds;
    currentTimer.isRunning = true;
    currentTimer.isPaused = false;
    
    updateTimerDisplay(mode);
    
    timerInterval = setInterval(function() {
        if (!currentTimer.isPaused && currentTimer.isRunning) {
            currentTimer.seconds--;
            updateTimerDisplay(mode);
            
            if (currentTimer.seconds <= 0) {
                finishTimer(mode);
            }
        }
    }, 1000);
}

function updateTimerDisplay(mode) {
    const minutes = Math.floor(currentTimer.seconds / 60);
    const seconds = currentTimer.seconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const progress = ((currentTimer.totalSeconds - currentTimer.seconds) / currentTimer.totalSeconds) * 100;
    
    if (mode === 'fullscreen') {
        if (timeLeft) timeLeft.textContent = timeString;
        if (timerLabel) timerLabel.textContent = 'Study Session';
        if (progressBar) progressBar.style.width = progress + '%';
    } else {
        if (overlayTime) overlayTime.textContent = timeString;
        if (overlayLabel) overlayLabel.textContent = 'Study Session';
        if (progressBarCamera) progressBarCamera.style.width = progress + '%';
    }
}

function pauseTimer(mode) {
    currentTimer.isPaused = !currentTimer.isPaused;
    const pauseButton = mode === 'fullscreen' ? pauseBtn : pauseBtnCamera;
    
    if (pauseButton) {
        pauseButton.textContent = currentTimer.isPaused ? '▶️ Resume' : '⏸️ Pause';
    }
}

function stopTimer(mode) {
    clearInterval(timerInterval);
    currentTimer.isRunning = false;
    currentTimer.isPaused = false;
    
    if (mode === 'fullscreen' && fullscreenTimerOverlay) {
        fullscreenTimerOverlay.style.display = 'none';
    } else if (mode === 'camera' && cameraTimerOverlay) {
        cameraTimerOverlay.style.display = 'none';
    }
    
    alert('Timer stopped! Great work on your study session.');
}

function finishTimer(mode) {
    clearInterval(timerInterval);
    currentTimer.isRunning = false;
    
    if (mode === 'fullscreen' && fullscreenTimerOverlay) {
        fullscreenTimerOverlay.style.display = 'none';
    } else if (mode === 'camera' && cameraTimerOverlay) {
        cameraTimerOverlay.style.display = 'none';
    }
    
    alert('🎉 Study session completed! Time for a well-deserved break.');
}

// Clean up webcam when page unloads
window.addEventListener('beforeunload', function() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
    }
});

// Initialize tasks functionality
function setupTasks() {
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    
    taskCheckboxes.forEach(function(checkbox) {
        // Set initial state
        updateTaskItemState(checkbox);
        
        // Add change listener
        checkbox.addEventListener('change', function() {
            updateTaskItemState(this);
        });
    });
    
    // Setup filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Filter functionality would go here
        });
    });
    
    // Setup add task modal
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addTaskModal = document.getElementById('addTaskModal');
    const closeAddTask = document.getElementById('closeAddTask');
    const cancelTask = document.getElementById('cancelTask');
    
    if (addTaskBtn && addTaskModal) {
        addTaskBtn.addEventListener('click', function() {
            addTaskModal.style.display = 'block';
        });
        
        if (closeAddTask) {
            closeAddTask.addEventListener('click', function() {
                addTaskModal.style.display = 'none';
            });
        }
        
        if (cancelTask) {
            cancelTask.addEventListener('click', function() {
                addTaskModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === addTaskModal) {
                addTaskModal.style.display = 'none';
            }
        });
    }
}

function updateTaskItemState(checkbox) {
    const taskItem = checkbox.closest('.task-item');
    if (!taskItem) return;
    
    if (checkbox.checked) {
        taskItem.classList.add('completed');
    } else {
        taskItem.classList.remove('completed');
    }
}

// Initialize leaderboard functionality
function setupLeaderboard() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Filter functionality would go here
        });
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize once
    if (typeof initApp === 'function') {
        initApp();
    }
});