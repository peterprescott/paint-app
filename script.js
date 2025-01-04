document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorButtons = document.querySelectorAll('.color-btn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const loadInput = document.getElementById('loadInput');
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');

    let isDrawing = false;
    let currentColor = '#000000';
    let brushSize = 5;
    let lastX = 0;
    let lastY = 0;

    // Initialize canvas with white background
    function initCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // Brush size slider
    brushSizeSlider.addEventListener('input', () => {
        brushSize = brushSizeSlider.value;
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
            };
            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
        // Reset the input to allow loading the same file again
        loadInput.value = '';
    });

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.stroke();

        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Set initial color (black)
    colorButtons[0].classList.add('active');

    // Initialize canvas
    initCanvas();
});
