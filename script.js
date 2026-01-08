/**
 * AI Stamp Generator Logic
 * 
 * Handles user input, generates the prompt based on a locked template,
 * manages UI state, and generates a client-side QR code.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('stampForm');
    const generateBtn = document.getElementById('generateBtn');
    const outputSection = document.getElementById('outputSection');
    const promptOutput = document.getElementById('promptOutput');
    const copyBtn = document.getElementById('copyBtn');
    const openAiBtn = document.getElementById('openAiBtn');
    const qrContainer = document.getElementById('qrcode');

    // Locked Base Prompt Configuration
    // Users cannot edit this structure.
    const BASE_PROMPT_TEMPLATE = `
*** SYSTEM INSTRUCTION: STAMP DESIGN GENERATOR ***
Create a high-quality, vintage postage stamp design.

[STRICT VISUAL CONSTRAINTS]
- Format: Perfectly Square Aspect Ratio (1:1).
- Style: 19th-Century Steel Engraving (Intaglio) / Line Art.
- Technique: Cross-hatching shading, monochromatic or duotone (Ink on Paper).
- Border: Ornate, decorative frame with classic guilloche patterns.
- Edges: Must show serrated / perforated philatelic edges.
- No photorealism, no 3D renders, no modern clean vectors.
- Text must be legible and integrated into the design.

[DESIGN CONTENT]
- MAIN SUBJECT: {{SYMBOL}}
- STAMP TITLE/VALUE: {{TITLE}}
- COUNTRY/ISSUER TEXT: {{COUNTRY}}

[OUTPUT DETAILS]
- High contrast, suitable for black & white printing.
- Centered composition.
- The image should look like an authentic scanned vintage stamp.
`;

    // State for QR Code instance
    let qrCodeInstance = null;

    /**
     * Handles Form Submission
     */
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Capture Inputs
        const country = document.getElementById('countryInput').value.trim();
        const title = document.getElementById('titleInput').value.trim();
        const symbol = document.getElementById('symbolInput').value.trim();

        if (!country || !title || !symbol) {
            alert('Please fill in all fields.');
            return;
        }

        // 2. Generate Final Prompt
        const finalPrompt = generatePrompt(country, title, symbol);

        // 3. Update UI
        promptOutput.value = finalPrompt;
        outputSection.classList.remove('hidden');

        // Scroll to output for better UX
        outputSection.scrollIntoView({ behavior: 'smooth' });

        // 4. Generate QR Code
        generateQRCode(finalPrompt);
    });

    /**
     * Constructs the final prompt by injecting user values into the base template.
     */
    function generatePrompt(country, title, symbol) {
        // Simple string replacement
        return BASE_PROMPT_TEMPLATE
            .replace('{{COUNTRY}}', country)
            .replace('{{TITLE}}', title)
            .replace('{{SYMBOL}}', symbol);
    }

    /**
     * Generates or updates the QR Code
     */
    function generateQRCode(text) {
        // Clear previous content
        qrContainer.innerHTML = '';

        if (typeof QRCode === 'undefined') {
            qrContainer.innerHTML = '<p style="color:red;">QR Library Offline/Missing</p>';
            return;
        }

        try {
            // Encode the first 300 chars to keep QR readable/scannable on screens
            // Full prompt might be too dense for a quick scan, but let's try full first.
            const dataToEncode = text.length > 500 ? text.substring(0, 500) + '...' : text;

            new QRCode(qrContainer, {
                text: dataToEncode,
                width: 128,
                height: 128,
                colorDark: "#2c3e50", // Match app accent
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        } catch (error) {
            console.error("QR Generation Error:", error);
            qrContainer.innerHTML = 'Error generating code';
        }
    }

    /**
     * Copy to Clipboard Functionality
     */
    copyBtn.addEventListener('click', () => {
        if (!navigator.clipboard) {
            // Fallback for older browsers
            promptOutput.select();
            document.execCommand('copy');
            showFeedback(copyBtn, 'Copied!');
            return;
        }

        navigator.clipboard.writeText(promptOutput.value)
            .then(() => {
                showFeedback(copyBtn, 'Copied!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showFeedback(copyBtn, 'Error');
            });
    });

    /**
     * Open Google AI Studio
     */
    openAiBtn.addEventListener('click', () => {
        // Copy first (convenience) then open
        // We replicate the copy logic here to ensure user has it ready to paste
        const promptText = promptOutput.value;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(promptText).catch(() => { });
        } else {
            promptOutput.select();
            document.execCommand('copy');
        }

        window.open('https://aistudio.google.com/app', '_blank');
    });

    /**
     * UI Helper: Button feedback
     */
    function showFeedback(button, message) {
        const originalText = button.innerHTML;
        button.innerText = message;
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 1500);
    }

    /**
     * Reset Button Logic
     */
    const resetBtn = document.getElementById('resetBtn');

    resetBtn.addEventListener('click', () => {
        // 1. Clear all input fields
        form.reset();

        // 2. Hide the output section
        outputSection.classList.add('hidden');

        // 3. Clear the generated prompt text
        promptOutput.value = '';

        // 4. Remove the QR code
        qrContainer.innerHTML = '';

        // 5. Scroll back to the top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
