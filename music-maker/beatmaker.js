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
function playSounds(column, lineOfMusicInstance) {
    const gridData = lineOfMusicInstance.gridData;
    
    // Iterate through each instrument type
    for (let type in sounds) {
        for (let instrumentKey in sounds[type]) {
            // Find the specific row for this instrument
            const row = INSTRUMENT_ROWS[instrumentKey];
            
            // Check if there's a sound in this specific row and column
            const cell = gridData[row][column];
            
            if (cell !== null) {
                // Play the sound for the row's original instrument
                const soundFunc = sounds[type][instrumentKey];
                soundFunc();
            }
        }
    }
}

// Global variables for sequential line playing
let currentLineIndex = 0;
let lineContainers = [];
let isPlaying = false;
let currentColumn = 0;
let tempo = 250;

function sequencerLoop() {
    if (!isPlaying) return;

    // Get all LineOfMusic containers on first call
    if (lineContainers.length === 0) {
        const linesOfMusicContainer = document.getElementById('linesOfMusicContainer');
        lineContainers = Array.from(linesOfMusicContainer.querySelectorAll('.lineOfMusic-controls'));
    }

    // Get the current line instance
    const currentLineContainer = lineContainers[currentLineIndex];
    const lineOfMusicInstance = currentLineContainer.__lineOfMusicInstance;

    if (lineOfMusicInstance) {
        // Find the grid associated with this line
        const grid = currentLineContainer.closest('.lineOfMusic-container')?.querySelector('.grid');
        
        if (grid) {
            // Reset all grid cells in this line
            const gridCells = grid.querySelectorAll('.grid-cell');
            gridCells.forEach(cell => {
                cell.style.opacity = '1';
                cell.style.boxShadow = 'none';
                cell.style.transform = 'scale(1)';
            });

            // Highlight current column
            const currentColumnCells = grid.querySelectorAll(`.grid-cell[data-col="${currentColumn}"]`);
            currentColumnCells.forEach(cell => {
                cell.style.opacity = '1';
                cell.style.boxShadow = '0 0 10px 3px rgba(255, 255, 255, 0.7)';
                cell.style.transform = 'scale(1.05)';
            });
        }

        // Play sounds for the current column on this line
        playSounds(currentColumn, lineOfMusicInstance);
    }

    // Increment column
    currentColumn = (currentColumn + 1) % 16;

    // Move to next line if we've played the full column
    if (currentColumn === 0) {
        currentLineIndex = (currentLineIndex + 1) % lineContainers.length;
    }

    // Schedule next iteration
    setTimeout(sequencerLoop, tempo);
}

// Play/Pause Event Listener
document.getElementById('playPauseBtn').addEventListener('click', () => {
    isPlaying = !isPlaying;
    const playPauseBtn = document.getElementById('playPauseBtn');

    if (isPlaying) {
        // Reset line index when starting playback
        currentLineIndex = 0;
        currentColumn = 0;
        lineContainers = [];

        playPauseBtn.textContent = '❚❚';  // Pause symbol
        sequencerLoop();
    } else {
        playPauseBtn.textContent = '▶';  // Play symbol
    }
});

// Event Listeners
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
    let selectedInstrument = null;
});

// Volume Control
document.getElementById('volumeSlider').addEventListener('input', (event) => {
    const volume = parseFloat(event.target.value);
    masterGainNode.gain.setValueAtTime(volume, audioContext.currentTime);
});

// Global event listener for spacebar play/pause
document.addEventListener('keydown', (event) => {
    // Check if spacebar is pressed
    if (event.code === 'Space') {
        // Prevent default spacebar behavior (scrolling)
        event.preventDefault();
        
        // Trigger play/pause
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn.click();
    }
});

// LineOfMusic class
class LineOfMusic {
    constructor(options = {}) {
        // Define lists for random name generation
        const adjectives = [
            'funky', 'jazzy', 'groovy', 'cosmic', 'electric', 
            'psychedelic', 'smooth', 'wild', 'epic', 'experimental'
        ];

        const composers = [
            'beethoven', 'eminem', 'daftpunk', 'mozart', 'bach', 
            'kendrick', 'tchaikovsky', 'bowie', 'zappa', 'vivaldi'
        ];

        const nouns = [
            'beat', 'loop', 'motif', 'rhythm', 'groove', 
            'sequence', 'pattern', 'wave', 'pulse', 'flow'
        ];

        // Generate a random name
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomComposer = composers[Math.floor(Math.random() * composers.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNumber = Math.floor(Math.random() * 10000) + 1;

        // Default options
        this.options = {
            name: `${randomAdjective}_${randomComposer}_${randomNoun}_${randomNumber}`,
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

        // Add a reference to the instance on the container for easy access
        this.container.querySelector('.lineOfMusic-controls').__lineOfMusicInstance = this;
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
        controlsDiv.style.display = 'flex';
        controlsDiv.style.justifyContent = 'space-between';
        controlsDiv.style.alignItems = 'center';
        controlsDiv.style.width = '100%';

        // Name container (to hold name and edit button)
        const nameContainer = document.createElement('div');
        nameContainer.style.display = 'flex';
        nameContainer.style.alignItems = 'center';
        nameContainer.style.gap = '10px';
        nameContainer.style.flex = '1';

        // Name div (left-aligned)
        const nameDiv = document.createElement('div');
        nameDiv.id = `lineOfMusicName-${LineOfMusic.instanceCount}`;
        nameDiv.contentEditable = 'false';
        nameDiv.textContent = this.options.name;
        nameDiv.style.overflow = 'hidden';
        nameDiv.style.textOverflow = 'ellipsis';
        nameDiv.style.whiteSpace = 'nowrap';

        // Status message div
        const statusDiv = document.createElement('div');
        statusDiv.style.flex = '1';
        statusDiv.style.textAlign = 'center';
        statusDiv.style.color = '#888';
        statusDiv.style.fontStyle = 'italic';
        statusDiv.style.fontSize = '0.8em';
        statusDiv.style.maxWidth = '400px';  
        statusDiv.style.margin = '0 auto';  
        statusDiv.style.wordWrap = 'break-word';  

        // Method to update status message
        this.updateStatus = (message, isError = false) => {
            statusDiv.textContent = message;
            statusDiv.style.color = isError ? '#ff4444' : '#888';
            
            // Clear message after 3 seconds
            clearTimeout(this.statusTimeout);
            this.statusTimeout = setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        };

        // Modify handleCellClick to add status message
        const originalHandleCellClick = this.handleCellClick;
        this.handleCellClick = (event) => {
            // Store the previous state of the cell before modification
            const cell = event.target;
            const rowIndex = Array.from(cell.parentNode.parentNode.children).indexOf(cell.parentNode);
            const colIndex = Array.from(cell.parentNode.children).indexOf(cell);
            const currentInstrument = selectedInstrument;
            const previousCellState = this.gridData[rowIndex][colIndex];

            // Call original handleCellClick method
            originalHandleCellClick.call(this, event);

            // Update status based on cell state change
            if (previousCellState === null) {
                // Sound was added
                this.updateStatus(`Added ${currentInstrument.type} ${currentInstrument.key} to bar ${Math.floor(colIndex / 4) + 1}, beat ${(colIndex % 4) + 1}.`);
            } else {
                // Sound was removed
                this.updateStatus(`Removed ${previousCellState.type} ${previousCellState.key} from bar ${Math.floor(colIndex / 4) + 1}, beat ${(colIndex % 4) + 1}.`);
            }
        };

        // Modify save method to add status message
        const originalSave = this.save;
        this.save = () => {
            // Check if the grid has any sounds
            const hasAnySounds = this.gridData.some(row => 
                row.some(cell => cell !== null)
            );

            if (!hasAnySounds) {
                this.updateStatus('Unable to save until sounds are added', true);
                return;
            }

            // Proceed with saving if grid has sounds
            const savedLines = JSON.parse(localStorage.getItem('savedLineOfMusic') || '{}');
            
            // Save or update the line
            savedLines[this.options.name] = {
                name: this.options.name,
                grid: JSON.stringify(this.gridData),
                timestamp: new Date().toISOString()
            };

            // Save to localStorage
            localStorage.setItem('savedLineOfMusic', JSON.stringify(savedLines));

            // Optional: Provide visual feedback
            this.grid.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            setTimeout(() => {
                this.grid.style.backgroundColor = '';
            }, 500);
            this.updateStatus('Saved successfully');
        };

        // Modify load method to add status message
        const originalLoad = this.load;
        this.load = () => {
            // Call original load method
            const loadResult = originalLoad.call(this);
       const currentInstrument = this.instruments[this.selectedInstrumentIndex];
       this.updateStatus(`Added ${currentInstrument.type} ${currentInstrument.key} to bar ${Math.floor(colIndex / 4) + 1}, beat ${(colIndex % 4) + 1}`); };

        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = '✎';
        editButton.style.backgroundColor = '#555';
        editButton.style.color = 'white';
        editButton.style.border = 'none';
        editButton.style.borderRadius = '4px';
        editButton.style.padding = '2px 6px';
        editButton.style.fontSize = '12px';
        editButton.style.cursor = 'pointer';

        // Lists for validation
        const adjectives = [
            'funky', 'jazzy', 'groovy', 'cosmic', 'electric', 
            'psychedelic', 'smooth', 'wild', 'epic', 'experimental'
        ];

        const composers = [
            'beethoven', 'eminem', 'daftpunk', 'mozart', 'bach', 
            'kendrick', 'tchaikovsky', 'bowie', 'zappa', 'vivaldi'
        ];

        const nouns = [
            'beat', 'loop', 'motif', 'rhythm', 'groove', 
            'sequence', 'pattern', 'wave', 'pulse', 'flow'
        ];

        // Edit modal
        const editModal = document.createElement('div');
        editModal.style.display = 'none';
        editModal.style.position = 'fixed';
        editModal.style.top = '50%';
        editModal.style.left = '50%';
        editModal.style.transform = 'translate(-50%, -50%)';
        editModal.style.backgroundColor = '#333';
        editModal.style.padding = '20px';
        editModal.style.borderRadius = '8px';
        editModal.style.zIndex = '1000';

        const modalContent = document.createElement('div');
        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';
        modalContent.style.gap = '10px';

        // Edit sections
        const sections = [
            { label: 'Adjective', list: adjectives },
            { label: 'Composer', list: composers },
            { label: 'Noun', list: nouns }
        ];

        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            
            const label = document.createElement('label');
            label.textContent = `${section.label}: `;
            label.style.color = 'white';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.style.width = '100%';
            input.style.padding = '5px';
            input.style.backgroundColor = '#444';
            input.style.color = 'white';
            input.style.border = '1px solid #666';
            input.style.borderRadius = '4px';
            
            sectionDiv.appendChild(label);
            sectionDiv.appendChild(input);
            modalContent.appendChild(sectionDiv);
        });

        // Save button
        const saveModalBtn = document.createElement('button');
        saveModalBtn.textContent = 'Save';
        saveModalBtn.style.backgroundColor = '#268bd2';
        saveModalBtn.style.color = 'white';
        saveModalBtn.style.border = 'none';
        saveModalBtn.style.padding = '10px';
        saveModalBtn.style.borderRadius = '4px';

        // Cancel button
        const cancelModalBtn = document.createElement('button');
        cancelModalBtn.textContent = 'Cancel';
        cancelModalBtn.style.backgroundColor = '#555';
        cancelModalBtn.style.color = 'white';
        cancelModalBtn.style.border = 'none';
        cancelModalBtn.style.padding = '10px';
        cancelModalBtn.style.borderRadius = '4px';

        // Modal buttons container
        const modalButtonsContainer = document.createElement('div');
        modalButtonsContainer.style.display = 'flex';
        modalButtonsContainer.style.justifyContent = 'space-between';
        modalButtonsContainer.appendChild(saveModalBtn);
        modalButtonsContainer.appendChild(cancelModalBtn);

        modalContent.appendChild(modalButtonsContainer);
        editModal.appendChild(modalContent);
        document.body.appendChild(editModal);

        // Edit button click handler
        editButton.addEventListener('click', () => {
            // Split the current name
            const [currentAdjective, currentComposer, currentNoun, currentNumber] = this.options.name.split('_');
            
            // Set current values in inputs
            modalContent.querySelectorAll('input')[0].value = currentAdjective;
            modalContent.querySelectorAll('input')[1].value = currentComposer;
            modalContent.querySelectorAll('input')[2].value = currentNoun;

            // Show modal
            editModal.style.display = 'block';
        });

        // Save modal button handler
        saveModalBtn.addEventListener('click', () => {
            const [, , , currentNumber] = this.options.name.split('_');
            const newAdjective = modalContent.querySelectorAll('input')[0].value.toLowerCase().trim();
            const newComposer = modalContent.querySelectorAll('input')[1].value.toLowerCase().trim();
            const newNoun = modalContent.querySelectorAll('input')[2].value.toLowerCase().trim();

            // Validate inputs against lists
            const isValidAdjective = adjectives.includes(newAdjective);
            const isValidComposer = composers.includes(newComposer);
            const isValidNoun = nouns.includes(newNoun);

            if (isValidAdjective && isValidComposer && isValidNoun) {
                const newName = `${newAdjective}_${newComposer}_${newNoun}_${currentNumber}`;
                
                // Update name
                this.options.name = newName;
                nameDiv.textContent = newName;

                // Hide modal
                editModal.style.display = 'none';
            } else {
                // Highlight invalid inputs
                modalContent.querySelectorAll('input')[0].style.borderColor = isValidAdjective ? '#666' : 'red';
                modalContent.querySelectorAll('input')[1].style.borderColor = isValidComposer ? '#666' : 'red';
                modalContent.querySelectorAll('input')[2].style.borderColor = isValidNoun ? '#666' : 'red';
            }
        });

        // Cancel modal button handler
        cancelModalBtn.addEventListener('click', () => {
            // Hide modal
            editModal.style.display = 'none';
        });

        // Append name and edit button to container
        nameContainer.appendChild(nameDiv);
        nameContainer.appendChild(editButton);

        // Button container (right-aligned)
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '5px';

        // Save button (Solarized blue)
        const saveBtn = this.createButton(' Save', () => this.save());
        saveBtn.style.marginLeft = 'auto';
        saveBtn.style.backgroundColor = '#268bd2';  // Solarized blue
        saveBtn.style.color = 'white';

        // Load button (Pale yellow)
        const loadBtn = this.createButton(' Load', () => this.load());
        loadBtn.style.backgroundColor = '#b58900';  // Solarized yellow
        loadBtn.style.color = 'white';

        // Delete button
        const deleteButton = this.createButton(' Delete️', () => this.delete(), 'delete-btn');
        deleteButton.style.backgroundColor = '#dc322f';  // Solarized red
        deleteButton.style.color = 'white';

        // Toggle Grid Visibility button
        const toggleGridButton = this.createButton('Toggle Grid Visibility', () => {
            const grid = this.grid;
            if (grid.style.display === 'none') {
                grid.style.display = 'block';
            } else {
                grid.style.display = 'none';
            }
        }, 'toggle-grid-btn');
        toggleGridButton.style.backgroundColor = '#d33682';  // Solarized magenta/purple
        toggleGridButton.style.color = 'white';

        // New Line button
        const newLineButton = this.createButton(' New Line ↓', () => {
            // Create a new LineOfMusic instance and add it below the current one
            const newLine = new LineOfMusic();
            
            // If this is part of a container, insert the new line after this one
            if (this.container.parentNode) {
                this.container.parentNode.insertBefore(newLine.container, this.container.nextSibling);
            }
        }, 'new-line-btn');
        newLineButton.style.backgroundColor = '#859900';  // Solarized green
        newLineButton.style.color = 'white';

        // Append buttons to container
        buttonsContainer.appendChild(saveBtn);
        buttonsContainer.appendChild(loadBtn);
        buttonsContainer.appendChild(deleteButton);
        buttonsContainer.appendChild(toggleGridButton);
        buttonsContainer.appendChild(newLineButton);

        // Append name container, status div, and button container
        controlsDiv.appendChild(nameContainer);
        controlsDiv.appendChild(statusDiv);
        controlsDiv.appendChild(buttonsContainer);

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

        const clickedCell = event.target;
        const col = parseInt(clickedCell.dataset.col);

        // Find the right row for the selected instrument
        const row = INSTRUMENT_ROWS[selectedInstrument.key];

        // Check if the cell already has a sound
        const existingSound = this.gridData[row][col];

        // Toggle sound: remove if exists, add if doesn't exist
        if (existingSound) {
            // Remove sound
            this.gridData[row][col] = null;
            
            // Find the target cell in the current grid
            const targetCell = this.grid.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
            
            // Reset cell style
            targetCell.style.backgroundColor = '';
            targetCell.classList.remove('active');
        } else {
            // Add sound
            this.gridData[row][col] = selectedInstrument;

            // Find the target cell in the current grid
            const targetCell = this.grid.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
            
            // Color the cell based on the selected instrument
            targetCell.style.backgroundColor = getColor(selectedInstrument.type, selectedInstrument.key);
            targetCell.classList.add('active');
        }
    }

    save() {
        // Check if the grid has any sounds
        const hasAnySounds = this.gridData.some(row => 
            row.some(cell => cell !== null)
        );

        if (!hasAnySounds) {
            // Optional: Add visual feedback
            this.grid.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            setTimeout(() => {
                this.grid.style.backgroundColor = '';
            }, 500);
            this.updateStatus('Unable to save until sounds are added', true);
            return;
        }

        // Proceed with saving if grid has sounds
        const savedLines = JSON.parse(localStorage.getItem('savedLineOfMusic') || '{}');
        
        // Save or update the line
        savedLines[this.options.name] = {
            name: this.options.name,
            grid: JSON.stringify(this.gridData),
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('savedLineOfMusic', JSON.stringify(savedLines));

        // Optional: Provide visual feedback
        this.grid.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        setTimeout(() => {
            this.grid.style.backgroundColor = '';
        }, 500);
        this.updateStatus('Saved successfully');
    }

    load() {
        const savedLines = JSON.parse(localStorage.getItem('savedLineOfMusic') || '{}');
        const savedLineOfMusicList = document.getElementById('savedLineOfMusicList');
        
        savedLineOfMusicList.innerHTML = '';
        
        if (Object.keys(savedLines).length === 0) {
            const noLinesMessage = document.createElement('p');
            noLinesMessage.textContent = 'No saved lines of music found.';
            savedLineOfMusicList.appendChild(noLinesMessage);
        } else {
            Object.values(savedLines).forEach(line => {
                // Create a container for each line entry
                const lineEntryContainer = document.createElement('div');
                lineEntryContainer.style.display = 'flex';
                lineEntryContainer.style.alignItems = 'center';
                lineEntryContainer.style.marginBottom = '10px';

                // Create line button
                const lineButton = document.createElement('button');
                lineButton.textContent = `${line.name} (Saved: ${new Date(line.timestamp).toLocaleString()})`;
                lineButton.style.flex = '1';
                lineButton.style.backgroundColor = '#555';
                lineButton.style.color = 'white';
                lineButton.style.border = 'none';
                lineButton.style.padding = '10px';
                lineButton.style.borderRadius = '5px';
                lineButton.style.marginRight = '10px';
                
                lineButton.addEventListener('click', () => {
                    const gridData = JSON.parse(line.grid);
                    this.loadGridData(gridData, line.name);
                    document.getElementById('loadLineOfMusicModal').style.display = 'none';
                });

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '✕';
                deleteButton.style.backgroundColor = 'transparent';
                deleteButton.style.color = '#888';
                deleteButton.style.border = 'none';
                deleteButton.style.padding = '0 5px';
                deleteButton.style.fontSize = '16px';
                deleteButton.style.cursor = 'pointer';
                deleteButton.style.fontWeight = 'bold';

                deleteButton.addEventListener('click', (event) => {
                    // Stop propagation to prevent load action
                    event.stopPropagation();

                    // Remove from saved lines
                    delete savedLines[line.name];
                    localStorage.setItem('savedLineOfMusic', JSON.stringify(savedLines));

                    // Remove from the list
                    lineEntryContainer.remove();

                    // If no lines left, show "No saved lines" message
                    if (Object.keys(savedLines).length === 0) {
                        savedLineOfMusicList.innerHTML = '<p>No saved lines of music found.</p>';
                    }
                });

                // Append button and delete to container
                lineEntryContainer.appendChild(lineButton);
                lineEntryContainer.appendChild(deleteButton);

                savedLineOfMusicList.appendChild(lineEntryContainer);
            });
        }
        
        // Add cancel button (always added, regardless of saved lines)
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.display = 'block';
        cancelButton.style.width = '100%';
        cancelButton.style.marginTop = '10px';
        cancelButton.style.backgroundColor = '#444';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.padding = '10px';
        cancelButton.style.borderRadius = '5px';
        
        cancelButton.addEventListener('click', () => {
            document.getElementById('loadLineOfMusicModal').style.display = 'none';
        });
        
        savedLineOfMusicList.appendChild(cancelButton);
        
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
