document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorButtons = document.querySelectorAll('.color-btn');
    const brushStyleButtons = document.querySelectorAll('.brush-style-btn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const loadInput = document.getElementById('loadInput');
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const colorPickerOverlay = document.getElementById('colorPickerOverlay');
    const customColorPicker = document.getElementById('customColorPicker');
    const colorPickerBtn = document.querySelector('.color-picker-btn');
    const confirmColorBtn = document.getElementById('confirmColorBtn');
    const cancelColorBtn = document.getElementById('cancelColorBtn');

    let isDrawing = false;
    let currentColor = '#000000';
    let currentBrushStyle = 'pencil';
    let brushSize = 5;
    let lastX = 0;
    let lastY = 0;
    let sprayInterval = null;

    // Canvas state management
    const MAX_HISTORY = 20;
    let canvasHistory = [];
    let historyIndex = -1;

    // Save current canvas state
    function saveCanvasState() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // If we're not at the latest state, remove future states
        if (historyIndex < canvasHistory.length - 1) {
            canvasHistory = canvasHistory.slice(0, historyIndex + 1);
        }

        // Add new state
        canvasHistory.push(imageData);
        
        // Limit history size
        if (canvasHistory.length > MAX_HISTORY) {
            canvasHistory.shift();
        }

        // Update history index
        historyIndex = canvasHistory.length - 1;

        // Update undo/redo button states
        updateUndoRedoButtons();
    }

    // Update undo/redo button states
    function updateUndoRedoButtons() {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= canvasHistory.length - 1;
    }

    // Undo functionality
    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            ctx.putImageData(canvasHistory[historyIndex], 0, 0);
            updateUndoRedoButtons();
        }
    });

    // Redo functionality
    redoBtn.addEventListener('click', () => {
        if (historyIndex < canvasHistory.length - 1) {
            historyIndex++;
            ctx.putImageData(canvasHistory[historyIndex], 0, 0);
            updateUndoRedoButtons();
        }
    });

    // Initialize canvas with white background
    function initCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveCanvasState();
    }

    // Generate cute filename
    function generateCuteFileName() {
        const adjectives = ['funny', 'silly', 'happy', 'crazy', 'super', 'magic', 'wild'];
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];
        const nouns = ['clown', 'unicorn', 'dragon', 'robot', 'monster', 'rocket', 'pirate'];

        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

        return `${randomAdjective}-${randomColor}-${randomNoun}.jpg`;
    }

    // Color selection
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to selected button
            button.classList.add('active');
            
            // Set current color
            currentColor = button.dataset.color;
        });
    });

    // Brush style selection
    brushStyleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            brushStyleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to selected button
            button.classList.add('active');
            
            // Set current brush style
            currentBrushStyle = button.dataset.style;
        });
    });

    // Brush size slider
    brushSizeSlider.addEventListener('input', () => {
        brushSize = Math.pow(brushSizeSlider.value, 2);
        brushSizeValue.textContent = brushSize;
    });

    // Clear canvas functionality
    clearBtn.addEventListener('click', () => {
        initCanvas();
    });

    // Save canvas functionality
    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = generateCuteFileName();
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    });

    // Load canvas functionality
    loadBtn.addEventListener('click', () => {
        loadInput.click();
    });

    loadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Clear canvas and draw loaded image
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                saveCanvasState();
            };
            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
        // Reset the input to allow loading the same file again
        loadInput.value = '';
    });

    // Color picker functionality
    colorPickerBtn.addEventListener('click', () => {
        // Set initial color to current color
        customColorPicker.value = currentColor;
        colorPickerOverlay.style.display = 'flex';
    });

    // Helper function to convert RGB to Hex
    function rgbToHex(rgb) {
        // Remove 'rgb()' and split into components
        const matches = rgb.match(/\d+/g);
        
        // If no matches or not enough components, return black
        if (!matches || matches.length < 3) {
            return '#000000';
        }
        
        // Convert to hex
        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');
        
        return `#${r}${g}${b}`;
    }

    confirmColorBtn.addEventListener('click', () => {
        const selectedColor = customColorPicker.value;

        // Remove active class from all color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to color picker button
        colorPickerBtn.classList.add('active');
        
        // Set current color
        currentColor = selectedColor;
        
        // Update color picker button background
        colorPickerBtn.style.backgroundColor = selectedColor;
        
        // Hide overlay
        colorPickerOverlay.style.display = 'none';
    });

    cancelColorBtn.addEventListener('click', () => {
        colorPickerOverlay.style.display = 'none';
    });

    // Close overlay if clicked outside modal
    colorPickerOverlay.addEventListener('click', (e) => {
        if (e.target === colorPickerOverlay) {
            // Automatically select the current color in the picker
            const selectedColor = customColorPicker.value;

            // Remove active class from all color buttons
            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to color picker button
            colorPickerBtn.classList.add('active');
            
            // Set current color
            currentColor = selectedColor;
            
            // Update color picker button background
            colorPickerBtn.style.backgroundColor = selectedColor;
            
            // Hide overlay
            colorPickerOverlay.style.display = 'none';
        }
    });

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];

        // Fill entire canvas if fill style is selected
        if (currentBrushStyle === 'fill') {
            ctx.fillStyle = currentColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Save current state to history
            saveCanvasState();
            return;
        }

        // Start spray paint if selected
        if (currentBrushStyle === 'spray') {
            sprayPaint(e);
            sprayInterval = setInterval(() => sprayPaint({offsetX: lastX, offsetY: lastY}), 50);
        }
    }

    function draw(e) {
        if (!isDrawing) return;

        if (currentBrushStyle === 'pencil') {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.stroke();

            [lastX, lastY] = [e.offsetX, e.offsetY];
        } else if (currentBrushStyle === 'spray') {
            // Update spray paint location
            [lastX, lastY] = [e.offsetX, e.offsetY];
            sprayPaint(e);
        }
    }

    function stopDrawing() {
        if (isDrawing) {
            saveCanvasState();
        }
        
        isDrawing = false;
        
        // Stop spray paint interval
        if (sprayInterval) {
            clearInterval(sprayInterval);
            sprayInterval = null;
        }
    }

    function sprayPaint(e) {
        ctx.fillStyle = currentColor;
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (brushSize * 2);
            const sprayX = e.offsetX + radius * Math.cos(angle);
            const sprayY = e.offsetY + radius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.arc(sprayX, sprayY, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Set initial color and brush style
    colorButtons[0].classList.add('active');
    brushStyleButtons[0].classList.add('active');

    // Initialize canvas
    initCanvas();
});
