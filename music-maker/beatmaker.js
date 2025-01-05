// Audio Context and Global Variables
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const masterGainNode = audioContext.createGain();
masterGainNode.connect(audioContext.destination);
masterGainNode.gain.value = 0.5; // Default 50% volume

// Sound Definitions
const sounds = {
    drums: {
        kick: createOscillatorSound(100, 0.5, 'sine'),
        snare: createNoiseSound(2.0),
        hihat: createNoiseSound(1.0)
    },
    bass: {
        lowBass: createOscillatorSound(80, 4.0, 'triangle'),
        midBass: createOscillatorSound(120, 3.0, 'sawtooth'),
        highBass: createOscillatorSound(180, 2.0, 'square')
    },
    synth: {
        chord1: createChordSound([261.63, 329.63, 392.00], 3.0),
        chord2: createChordSound([220.00, 277.18, 329.63], 3.0),
        lead: createOscillatorSound(440, 2.0, 'sine')
    },
    custom: {
        1: createOscillatorSound(220, 3.0, 'sine'),
        2: createOscillatorSound(330, 3.0, 'triangle'),
        3: createOscillatorSound(440, 3.0, 'square')
    }
};

// Custom Sound State Management
const customSoundState = {
    1: {
        name: 'Custom 1',
        color: '#FF6B6B',
        frequency: 440,
        amplitude: 5,
        waveType: 'sine'
    },
    2: {
        name: 'Custom 2', 
        color: '#4ECDC4',
        frequency: 440,
        amplitude: 5,
        waveType: 'sine'
    },
    3: {
        name: 'Custom 3',
        color: '#45B7D1',
        frequency: 440,
        amplitude: 5,
        waveType: 'sine'
    }
};

// Precise row mapping for each specific instrument
const INSTRUMENT_ROWS = {
    // Drums
    'kick': 0,
    'snare': 1,
    'hihat': 2,
    
    // Bass
    'lowBass': 3,
    'midBass': 4,
    'highBass': 5,
    
    // Synth
    'chord1': 6,
    'chord2': 7,
    'lead': 8,
    
    // Custom
    '1': 9,
    '2': 10,
    '3': 11
};

// Play Sounds
function playSounds(column) {
    // Get all lines of music
    const linesOfMusic = document.querySelectorAll('.grid-container');
    
    linesOfMusic.forEach(lineContainer => {
        // Iterate through each instrument type
        for (let type in sounds) {
            for (let instrumentKey in sounds[type]) {
                // Find the correct row for this specific instrument
                const row = INSTRUMENT_ROWS[instrumentKey];
                
                // Find the specific grid for this line of music
                const grid = lineContainer.querySelector('.grid');
                
                // Check if there's a sound in this specific row and column
                const cell = grid.querySelector(`.grid-cell[data-row="${row}"][data-col="${column}"]`);
                
                if (cell && cell.classList.contains('active')) {
                    // Play the sound
                    sounds[type][instrumentKey]();
                }
            }
        }
    });
}

// Sequencer Loop
function sequencerLoop() {
    if (!isPlaying) return;

    // Highlight current column across all lines of music
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        if (parseInt(cell.dataset.col) === currentColumn) {
            cell.style.opacity = '0.7';
        } else {
            cell.style.opacity = '1';
        }
    });

    // Play sounds for the current column
    playSounds(currentColumn);

    // Move to next column
    currentColumn = (currentColumn + 1) % 16;

    // Schedule next iteration
    if (isPlaying) {
        setTimeout(sequencerLoop, 250); // Adjust tempo as needed
    }
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
    
    // Reset column highlighting
    const gridCells = document.querySelectorAll('.grid-cell');
    gridCells.forEach(cell => {
        cell.style.opacity = '1';
    });
});

document.querySelectorAll('.instrument button').forEach(button => {
    button.addEventListener('click', function() {
        const instrumentKey = this.getAttribute('onclick').match(/'([^']*)'/)[1];
        
        // Play the sound immediately
        for (let type in sounds) {
            if (sounds[type][instrumentKey]) {
                sounds[type][instrumentKey]();
                
                // Update selected instrument
                selectedInstrument = { type, key: instrumentKey };
                
                // Update button color
                this.style.backgroundColor = getColor(type, instrumentKey);
                
                break;
            }
        }
    });
});

// Add CSS for hover effect
const styleElement = document.createElement('style');
styleElement.textContent = `
.grid-cell {
    transition: border 0.1s ease-in-out;
}
`;
document.head.appendChild(styleElement);

// Utility Functions (from previous implementation)
function createOscillatorSound(frequency, duration, type = 'sine') {
    return () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(10, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGainNode); // Connect to master gain node
        
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
        gainNode.gain.setValueAtTime(10, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        sourceNode.connect(gainNode);
        gainNode.connect(masterGainNode); // Connect to master gain node
        
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
            
            gainNode.gain.setValueAtTime(10, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(masterGainNode); // Connect to master gain node
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        });
    };
}

// Color Mapping for Instruments
const colors = {
    drums: {
        kick: '#8B0000',
        snare: '#cb4b16',
        hihat: '#b58900'
    },
    bass: {
        lowBass: '#859900',
        midBass: '#2aa198',
        highBass: '#268bd2'
    },
    synth: {
        chord1: '#6c71c4',
        chord2: '#d33682',
        lead: '#93a1a1'
    },
    custom: {
        1: '#FF6B6B',
        2: '#4ECDC4',
        3: '#45B7D1'
    }
};

// Get color for a specific instrument
function getColor(type, key) {
    // First check if the color exists in the custom sound state
    if (type === 'custom') {
        const customState = customSoundState[key];
        if (customState && customState.color) {
            return customState.color;
        }
    }
    
    // Fallback to default colors
    return (colors[type] && colors[type][key]) || '#FFFFFF';
}

// Alias for backward compatibility
function getColorForInstrument(type, key) {
    return getColor(type, key);
}

// Add event listeners for custom sound modal
window.addEventListener('load', () => {
    let currentCustomInstrument = null;
    
    // Frequency slider live update
    const frequencySlider = document.getElementById('customFrequency');
    const frequencyValue = document.getElementById('frequencyValue');
    frequencySlider.addEventListener('input', () => {
        frequencyValue.textContent = `${frequencySlider.value} Hz`;
    });
    
    // Amplitude slider live update
    const amplitudeSlider = document.getElementById('customAmplitude');
    const amplitudeValue = document.getElementById('amplitudeValue');
    amplitudeSlider.addEventListener('input', () => {
        amplitudeValue.textContent = amplitudeSlider.value;
    });
    
    // Custom instrument buttons
    const customButtons = document.querySelectorAll('#custom button');
    customButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Use index + 1 to match the custom instrument numbering
            currentCustomInstrument = index + 1;
            const modal = document.getElementById('customSoundModal');
            
            // Populate modal with existing state
            const state = customSoundState[currentCustomInstrument];
            
            document.getElementById('customName').value = state.name;
            document.getElementById('customColor').value = state.color;
            
            frequencySlider.value = state.frequency;
            frequencyValue.textContent = `${state.frequency} Hz`;
            
            amplitudeSlider.value = state.amplitude;
            amplitudeValue.textContent = state.amplitude;
            
            document.getElementById('customWaveType').value = state.waveType;
            
            modal.style.display = 'flex';
        });
    });
    
    // Play custom sound
    document.getElementById('playCustomSound').addEventListener('click', () => {
        const frequency = parseFloat(frequencySlider.value);
        const amplitude = parseFloat(amplitudeSlider.value);
        const waveType = document.getElementById('customWaveType').value;
        
        // Create a temporary sound to play
        const tempSound = createCustomOscillatorSound(frequency, 3.0, waveType, amplitude);
        
        // Play the sound
        if (tempSound) {
            tempSound();
        }
    });
    
    // Create custom sound with specific parameters
    function createCustomOscillatorSound(frequency, duration, type, amplitude) {
        return () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(amplitude, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(masterGainNode);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    // Save custom sound
    document.getElementById('saveCustomSound').addEventListener('click', () => {
        console.log('Save button clicked');
        console.log('Current Custom Instrument:', currentCustomInstrument);
        
        const frequency = parseFloat(frequencySlider.value);
        const amplitude = parseFloat(amplitudeSlider.value);
        const waveType = document.getElementById('customWaveType').value;
        const customName = document.getElementById('customName').value;
        const customColor = document.getElementById('customColor').value;
        
        console.log('Frequency:', frequency);
        console.log('Amplitude:', amplitude);
        console.log('Wave Type:', waveType);
        console.log('Custom Name:', customName);
        console.log('Custom Color:', customColor);
        
        // Verify currentCustomInstrument is defined
        if (!currentCustomInstrument) {
            console.error('No custom instrument selected');
            return;
        }
        
        // Update custom sound state
        customSoundState[currentCustomInstrument] = {
            name: customName,
            color: customColor,
            frequency,
            amplitude,
            waveType
        };
        
        // Update button text and color
        const customButton = document.querySelector(`#custom button:nth-of-type(${currentCustomInstrument})`);
        
        if (!customButton) {
            console.error('Custom button not found');
            console.log('All custom buttons:', document.querySelectorAll('#custom button'));
            return;
        }
        
        customButton.textContent = customName;
        customButton.style.backgroundColor = customColor;
        
        // Create and save the new sound
        sounds.custom[currentCustomInstrument] = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = waveType;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(amplitude, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3.0);
            
            oscillator.connect(gainNode);
            gainNode.connect(masterGainNode);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 3.0);
        };
        
        // Close modal
        document.getElementById('customSoundModal').style.display = 'none';
    });
    
    // Cancel custom sound
    document.getElementById('cancelCustomSound').addEventListener('click', () => {
        document.getElementById('customSoundModal').style.display = 'none';
    });
});

// Initialize on page load
window.addEventListener('load', () => {
    // Initialize variables
    let isPlaying = false;
    let currentColumn = 0;
    let selectedInstrument = null;
});

// Volume Control
document.getElementById('volumeSlider').addEventListener('input', (event) => {
    const volume = parseFloat(event.target.value);
    masterGainNode.gain.setValueAtTime(volume, audioContext.currentTime);
});

// LineOfMusic class
class LineOfMusic {
    constructor(options = {}) {
        // Default options
        this.options = {
            name: `Rhythmora ${LineOfMusic.instanceCount + 1}`,
            gridRows: 12,  // Explicitly set to 12 rows
            gridCols: 16,  // Explicitly set to 16 columns
            ...options
        };

        // Increment instance count
        LineOfMusic.instanceCount++;

        // Initialize grid data
        this.gridData = Array(this.options.gridRows).fill().map(() => 
            Array(this.options.gridCols).fill(null)
        );

        // Create the container for this line of music
        this.container = this.createContainer();

        // Create the grid for this line of music
        this.grid = this.createGrid();

        // Attach to DOM
        this.render();
    }

    // Static property to track number of instances
    static instanceCount = 0;

    createContainer() {
        const container = document.createElement('div');
        container.classList.add('grid-container');
        container.id = `lineOfMusic-${LineOfMusic.instanceCount}`;

        return container;
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('lineOfMusic-controls');

        // Save button
        const saveBtn = this.createButton(' Save', () => this.save());

        // Load button
        const loadBtn = this.createButton(' Load', () => this.load());

        // Name div
        const nameDiv = document.createElement('div');
        nameDiv.id = `lineOfMusicName-${LineOfMusic.instanceCount}`;
        nameDiv.contentEditable = 'false';
        nameDiv.textContent = this.options.name;
        nameDiv.addEventListener('click', () => {
            nameDiv.contentEditable = nameDiv.contentEditable === 'true' ? 'false' : 'true';
            nameDiv.focus();
        });

        // Delete button
        const deleteBtn = this.createButton(' Delete', () => this.delete(), 'delete');

        // Append buttons to controls
        [saveBtn, loadBtn, nameDiv, deleteBtn].forEach(el => 
            controlsDiv.appendChild(el)
        );

        return controlsDiv;
    }

    createButton(text, clickHandler, extraClass = '') {
        const btn = document.createElement('button');
        btn.classList.add('lineOfMusic-btn');
        if (extraClass) btn.classList.add(extraClass);
        btn.textContent = text;
        btn.addEventListener('click', clickHandler);
        return btn;
    }

    createGrid() {
        const gridDiv = document.createElement('div');
        gridDiv.id = `grid-${LineOfMusic.instanceCount}`;
        gridDiv.classList.add('grid');

        // Create grid cells
        for (let row = 0; row < this.options.gridRows; row++) {
            const rowElement = document.createElement('div');
            rowElement.classList.add('grid-row');

            for (let col = 0; col < this.options.gridCols; col++) {
                const cellElement = document.createElement('div');
                cellElement.classList.add('grid-cell');
                cellElement.dataset.row = row;
                cellElement.dataset.col = col;
                
                cellElement.addEventListener('click', (event) => this.handleCellClick(event));
                
                rowElement.appendChild(cellElement);
            }
            
            gridDiv.appendChild(rowElement);
        }

        return gridDiv;
    }

    handleCellClick(event) {
        // Ensure an instrument is selected
        if (!selectedInstrument) {
            console.warn('No instrument selected');
            return;
        }

        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Check if the cell is already active for this instrument
        const currentCellData = this.gridData[row][col];
        
        if (currentCellData && 
            currentCellData.type === selectedInstrument.type && 
            currentCellData.key === selectedInstrument.key) {
            // If the same instrument is already in the cell, remove it
            this.gridData[row][col] = null;
            cell.classList.remove('active');
            cell.style.backgroundColor = '#333';
        } else {
            // Set the cell to the selected instrument
            this.gridData[row][col] = selectedInstrument;
            cell.classList.add('active');
            cell.style.backgroundColor = getColor(selectedInstrument.type, selectedInstrument.key);
        }
    }

    save() {
        const savedLines = JSON.parse(localStorage.getItem('savedLineOfMusic') || '{}');
        const name = this.container.querySelector('[id^="lineOfMusicName"]').textContent;

        savedLines[name] = {
            name: name,
            grid: JSON.stringify(this.gridData),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('savedLineOfMusic', JSON.stringify(savedLines));
        alert(`Saved "${name}" to localStorage`);
    }

    load() {
        const savedLines = JSON.parse(localStorage.getItem('savedLineOfMusic') || '{}');
        const savedLineOfMusicList = document.getElementById('savedLineOfMusicList');
        
        savedLineOfMusicList.innerHTML = '';
        
        if (Object.keys(savedLines).length === 0) {
            savedLineOfMusicList.innerHTML = '<p>No saved lines of music found.</p>';
        } else {
            Object.values(savedLines).forEach(line => {
                const lineButton = document.createElement('button');
                lineButton.textContent = `${line.name} (Saved: ${new Date(line.timestamp).toLocaleString()})`;
                lineButton.style.display = 'block';
                lineButton.style.width = '100%';
                lineButton.style.marginBottom = '10px';
                lineButton.style.backgroundColor = '#555';
                lineButton.style.color = 'white';
                lineButton.style.border = 'none';
                lineButton.style.padding = '10px';
                lineButton.style.borderRadius = '5px';
                
                lineButton.addEventListener('click', () => {
                    const gridData = JSON.parse(line.grid);
                    this.loadGridData(gridData, line.name);
                    document.getElementById('loadLineOfMusicModal').style.display = 'none';
                });
                
                savedLineOfMusicList.appendChild(lineButton);
            });
        }
        
        document.getElementById('loadLineOfMusicModal').style.display = 'flex';
    }

    loadGridData(gridData, name) {
        // Update grid data
        this.gridData = gridData;

        // Update grid display
        const cells = this.grid.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / this.options.gridCols);
            const col = index % this.options.gridCols;
            
            const cellData = gridData[row][col];
            
            if (cellData) {
                cell.style.backgroundColor = getColor(cellData.type, cellData.key);
                cell.classList.add('active');
            } else {
                cell.style.backgroundColor = '#333';
                cell.classList.remove('active');
            }
        });

        // Update name
        this.container.querySelector('[id^="lineOfMusicName"]').textContent = name;
    }

    delete() {
        // Prevent deleting if it's the last line of music
        const linesOfMusicContainer = this.container.parentElement;
        if (linesOfMusicContainer.children.length > 1) {
            this.container.remove();
        } else {
            alert('Cannot delete the last line of music');
        }
    }

    render() {
        // Clear previous contents
        this.container.innerHTML = '';

        // Add controls
        const controls = this.createControls();
        this.container.appendChild(controls);

        // Add grid
        this.container.appendChild(this.grid);

        // Add to DOM
        const linesOfMusicContainer = document.getElementById('linesOfMusicContainer') || 
            this.createLinesOfMusicContainer();
        linesOfMusicContainer.appendChild(this.container);
    }

    createLinesOfMusicContainer() {
        const container = document.createElement('div');
        container.id = 'linesOfMusicContainer';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '20px';
        document.body.appendChild(container);
        return container;
    }
}

// Create the initial line of music when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LineOfMusic();
});
