document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const languageSelect = document.getElementById('languageSelect');
    const translateBtn = document.getElementById('translateBtn');
    const translatedText = document.getElementById('translatedText');

    // List of common languages to populate the dropdown
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'ru', name: 'Russian' },
        { code: 'zh-CN', name: 'Chinese (Simplified)' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'bn', name: 'Bengali' },
        { code: 'ur', name: 'Urdu' }
    ];

    // Populate the language dropdown
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        languageSelect.appendChild(option);
    });

    translateBtn.addEventListener('click', async () => {
        const text = inputText.value;
        const targetLang = languageSelect.value;

        if (!text) {
            alert('Please enter text to translate.');
            return;
        }

        try {
            // Google Translate API URL
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // The translated text is in the first element of the first array
            const translation = data[0][0][0];
            translatedText.value = translation;

            // Save input and output to Translator.txt by triggering a download
            const log = `Input: ${text}\nOutput: ${translation}\n---\n`;
            const blob = new Blob([log], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'Translator.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error) {
            console.error('Translation error:', error);
            translatedText.value = 'Failed to translate. Please try again.';
        }
    });
});