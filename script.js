// PDF.js setup
const pdfUrl = 'https://pdfobject.com/pdf/sample.pdf';
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

async function renderPDF(url) {
    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const pageNumber = 1;
        const page = await pdf.getPage(pageNumber);

        // Get the viewport dimensions and scale
        const viewport = page.getViewport({ scale: 1 });
        const pdfWidthPoints = viewport.width;
        const pdfHeightPoints = viewport.height;

        // Convert points to inches
        const PDF_WIDTH_INCHES = pdfWidthPoints / 72;
        const PDF_HEIGHT_INCHES = pdfHeightPoints / 72;

        // Render the page with desired scale
        const SCALE = 1.5;
        const scaledViewport = page.getViewport({ scale: SCALE });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        await page.render(renderContext).promise;

        // Calculate DPI based on rendered PDF size and scale
        const DPI_X = (canvas.width / PDF_WIDTH_INCHES) / SCALE;
        const DPI_Y = (canvas.height / PDF_HEIGHT_INCHES) / SCALE;

        setupDragAndDrop(DPI_X, DPI_Y, PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES);
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

renderPDF(pdfUrl);

function setupDragAndDrop(DPI_X, DPI_Y, PDF_WIDTH_INCHES, PDF_HEIGHT_INCHES) {
    const img = document.getElementById('draggable-image');
    const coordinates = document.getElementById('coordinates');
    const canvasContainer = document.getElementById('canvas-container');
    let isDragging = false;
    let offsetX, offsetY;

    const PX_TO_CM_X = 2.54 / DPI_X;
    const PX_TO_CM_Y = 2.54 / DPI_Y;
    const PX_TO_MM_X = 25.4 / DPI_X;
    const PX_TO_MM_Y = 25.4 / DPI_Y;
    const PX_TO_INCH_X = 1 / DPI_X;
    const PX_TO_INCH_Y = 1 / DPI_Y;

    img.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - img.getBoundingClientRect().left;
        offsetY = e.clientY - img.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;

            // Get the boundaries of the canvas
            const canvasRect = canvasContainer.getBoundingClientRect();
            const imgRect = img.getBoundingClientRect();

            // Adjust position if it's out of bounds
            if (x < canvasRect.left) x = canvasRect.left;
            if (y < canvasRect.top) y = canvasRect.top;
            if (x + imgRect.width > canvasRect.right) x = canvasRect.right - imgRect.width;
            if (y + imgRect.height > canvasRect.bottom) y = canvasRect.bottom - imgRect.height;

            // Update image position
            img.style.left = `${x - canvasRect.left}px`;
            img.style.top = `${y - canvasRect.top}px`;

            // Convert coordinates to cm, mm, and inches
            const xCm = (x - canvasRect.left) * PX_TO_CM_X;
            const yCm = (y - canvasRect.top) * PX_TO_CM_Y;
            const xMm = (x - canvasRect.left) * PX_TO_MM_X;
            const yMm = (y - canvasRect.top) * PX_TO_MM_Y;
            const xInch = (x - canvasRect.left) * PX_TO_INCH_X;
            const yInch = (y - canvasRect.top) * PX_TO_INCH_Y;

            // Update coordinates display
            coordinates.textContent = `Coordinates: (x: ${xCm.toFixed(2)} cm, y: ${yCm.toFixed(2)} cm) | (x: ${xMm.toFixed(2)} mm, y: ${yMm.toFixed(2)} mm) | (x: ${xInch.toFixed(2)} in, y: ${yInch.toFixed(2)} in)`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}
