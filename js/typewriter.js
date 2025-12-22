/**
 * Typewriter Effect for Hero Section
 */

let phrases = [
    "> INITIALIZING SYSTEM...",
    "> CONNECTING NODES...",
    "> LOADING INTEGRATION PATTERNS...",
    "> SYSTEM READY."
];

function updatePhrases() {
    if (window.i18n && window.i18n.translations[window.i18n.currentLang]) {
        const translatedPhrases = window.i18n.t('hero.typing_phrases');
        if (Array.isArray(translatedPhrases)) {
            phrases = translatedPhrases;
        }
    }
}

let partIndex = 0;
let phraseIndex = 0;
let offset = 0;
let forwards = true;
let skipCount = 0;
const skipDelay = 15;
const speed = 70;

const targetElement = document.getElementById('typing-text');

const cursor = document.createElement('span');
cursor.className = 'typing-cursor';
cursor.textContent = '_';

if (targetElement) {
    updatePhrases();
    targetElement.appendChild(cursor);
    setInterval(wordFlick, speed);
}

// Listen for language changes
window.addEventListener('languageChanged', (e) => {
    updatePhrases();
    // Optionally reset animation
    phraseIndex = 0;
    offset = 0;
    forwards = true;
});

function wordFlick() {
    if (!targetElement) return;

    if (forwards) {
        if (offset >= phrases[phraseIndex].length) {
            ++skipCount;
            if (skipCount == skipDelay) {
                forwards = false;
                skipCount = 0;
            }
        }
    } else {
        if (offset == 0) {
            forwards = true;
            phraseIndex++;
            if (phraseIndex >= phrases.length) {
                phraseIndex = 0;
            }
        }
    }

    const part = phrases[phraseIndex].substr(0, offset);

    if (skipCount == 0) {
        if (forwards) {
            offset++;
        } else {
            offset--;
        }
    }

    targetElement.textContent = part;
    targetElement.appendChild(cursor);
}
