document.addEventListener('DOMContentLoaded', function () {
    const convertBtn = document.getElementById('convertBtn');
    const markdownInput = document.getElementById('markdownInput');
    const previewDiv = document.getElementById('preview');
    const formatSelect = document.getElementById('formatSelect');
    const fileInput = document.getElementById('fileInput');
    const converter = new showdown.Converter();

    // Preview functionality
    function updatePreview() {
        const markdown = markdownInput.value;
        const html = converter.makeHtml(markdown);
        previewDiv.innerHTML = html;
    }

    // File size check
    function checkFileSize(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showError('File size exceeds limit (10MB). Please choose a smaller file.');
            return false;
        }
        return true;
    }

    // Show error message
    function showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            ${message}
        `;

        const fileUploadContainer = document.querySelector('.file-upload-container');
        fileUploadContainer.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Handle file upload
    function handleFileUpload(file) {
        if (!file) return;

        if (!(file.name.endsWith('.md') || file.name.endsWith('.markdown'))) {
            showError('Please upload a .md or .markdown file!');
            return;
        }

        if (!checkFileSize(file)) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            markdownInput.value = e.target.result;
            updatePreview();
        };
        reader.readAsText(file);
    }

    // File input change handler
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        handleFileUpload(file);
    });

    // Drag and drop functionality
    markdownInput.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.classList.add('drag-active');
    });

    markdownInput.addEventListener('dragleave', function (e) {
        e.preventDefault();
        this.classList.remove('drag-active');
    });

    markdownInput.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('drag-active');
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    });

    // Input change handler
    markdownInput.addEventListener('input', updatePreview);

    // Convert and download functionality
    convertBtn.addEventListener('click', function () {
        const markdown = markdownInput.value;
        if (!markdown) {
            alert('Please enter some Markdown text!');
            return;
        }

        const html = converter.makeHtml(markdown);
        const format = formatSelect.value;

        const wordDocument = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>Exported Document</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;

        const blob = new Blob([wordDocument], {
            type: format === 'doc'
                ? 'application/msword'
                : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `document.${format}`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
    });

    // Initialize preview
    updatePreview();
}); 