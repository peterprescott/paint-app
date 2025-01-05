// Audio Context and Global Variables
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound Definitions
const sounds = {
    drums: {
        kick: createOscillatorSound(100, 0.5, 'sine'),
        snare: createNoiseSound(0.2),
        hihat: createNoiseSound(0.1)
    },
    bass: {
        lowBass: createOscillatorSound(80, 0.4, 'triangle'),
        midBass: createOscillatorSound(120, 0.3, 'sawtooth'),
        highBass: createOscillatorSound(180, 0.2, 'square')
    },
    synth: {
        chord1: createChordSound([261.63, 329.63, 392.00], 0.3),
        chord2: createChordSound([220.00, 277.18, 329.63], 0.3),
        lead: createOscillatorSound(440, 0.2, 'sine')
    }
};

// Grid Configuration
const ROWS = 9;  // 3 drums, 3 bass, 3 synth
const COLS = 16; // 16 bars
let grid = Array(ROWS).fill().map(() => Array(COLS).fill(null));
let currentColumn = 0;
let isPlaying = false;
let isRecording = false;
let selectedInstrument = null;

// Initialize Grid
function initializeGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';

    for (let row = 0; row < ROWS; row++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('grid-row');
        rowElement.style.display = 'flex';
        rowElement.style.height = `${100 / ROWS}%`;

        for (let col = 0; col < COLS; col++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('grid-cell');
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            cellElement.style.width = `${100 / COLS}%`;
            cellElement.style.border = '1px solid #444';
            cellElement.style.backgroundColor = '#333';
            
            cellElement.addEventListener('click', handleGridCellClick);
            
            rowElement.appendChild(cellElement);
        }
        
        gridElement.appendChild(rowElement);
    }
}

// Select Instrument
function selectInstrument(instrumentKey) {
    // Find the instrument type and key
    for (let type in sounds) {
        if (sounds[type][instrumentKey]) {
            selectedInstrument = { type, key: instrumentKey };
            break;
        }
    }
}

// Handle Grid Cell Click
function handleGridCellClick(event) {
    if (!isPlaying || !selectedInstrument) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    // Toggle cell state
    if (grid[row][col]) {
        grid[row][col] = null;
        event.target.style.backgroundColor = '#333';
    } else {
        grid[row][col] = selectedInstrument;
        event.target.style.backgroundColor = getColorForInstrument(selectedInstrument.type);
    }
}

// Play Sounds
function playSounds(column) {
    for (let row = 0; row < ROWS; row++) {
        const sound = grid[row][column];
        if (sound) {
            sounds[sound.type][sound.key]();
        }
    }
}

// Sequencer Loop
function sequencerLoop() {
    if (!isPlaying) return;

    // Highlight current column
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        if (parseInt(cell.dataset.col) === currentColumn) {
            cell.style.opacity = '0.7';
        } else {
            cell.style.opacity = '1';
        }
    });

    // Play sounds for current column
    playSounds(currentColumn);

    // Move to next column
    currentColumn = (currentColumn + 1) % COLS;

    // Schedule next iteration
    setTimeout(sequencerLoop, 250);  // Adjust tempo as needed
}

// Event Listeners
document.getElementById('playBtn').addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        currentColumn = 0;
        sequencerLoop();
    }
});

document.getElementById('stopBtn').addEventListener('click', () => {
    isPlaying = false;
    isRecording = false;
    
    // Reset column highlighting
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        cell.style.opacity = '1';
    });
});

document.getElementById('recordBtn').addEventListener('click', () => {
    if (isPlaying) {
        isRecording = !isRecording;
    }
});

document.querySelectorAll('.instrument button').forEach(button => {
    button.addEventListener('click', function() {
        const instrumentKey = this.getAttribute('onclick').match(/'([^']*)'/)[1];
        
        // Play the sound immediately
        for (let type in sounds) {
            if (sounds[type][instrumentKey]) {
                sounds[type][instrumentKey]();
                
                // If in recording mode and playing, also add to grid
                if (isPlaying && isRecording) {
                    const gridCells = document.querySelectorAll('.grid-cell');
                    gridCells.forEach(cell => {
                        if (parseInt(cell.dataset.col) === currentColumn) {
                            const row = parseInt(cell.dataset.row);
                            const instrumentType = type;
                            
                            // Find the matching row for this instrument type
                            const rows = {
                                'drums': [0, 1, 2],
                                'bass': [3, 4, 5],
                                'synth': [6, 7, 8]
                            };
                            
                            if (rows[instrumentType].includes(row)) {
                                // Toggle cell state
                                if (grid[row][currentColumn]) {
                                    grid[row][currentColumn] = null;
                                    cell.style.backgroundColor = '#333';
                                } else {
                                    grid[row][currentColumn] = { type: instrumentType, key: instrumentKey };
                                    cell.style.backgroundColor = getColorForInstrument(instrumentType);
                                }
                            }
                        }
                    });
                }
                
                break;
            }
        }
        
        // Always update selected instrument
        selectInstrument(instrumentKey);
    });
});

// Utility Functions (from previous implementation)
function createOscillatorSound(frequency, duration, type = 'sine') {
    return () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    };
}

function createNoiseSound(duration) {
    return () => {
        const bufferSize = audioContext.sampleRate * duration;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const sourceNode = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        sourceNode.buffer = noiseBuffer;
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        sourceNode.start();
        sourceNode.stop(audioContext.currentTime + duration);
    };
}

function createChordSound(frequencies, duration) {
    return () => {
        frequencies.forEach(freq => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        });
    };
}

function getColorForInstrument(type) {
    const colors = {
        'drums': '#FF6B6B',
        'bass': '#4ECDC4',
        'synth': '#45B7D1'
    };
    return colors[type] || '#FFFFFF';
}

// Initialize on page load
window.addEventListener('load', initializeGrid);
