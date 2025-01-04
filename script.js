document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    const colorButtons = document.querySelectorAll('.color-btn');

    let isDrawing = false;
    let currentColor = '#000000';
    let lastX = 0;
    let lastY = 0;

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
        ctx.lineWidth = 2;
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
});
