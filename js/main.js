// Theme Logic
const themes = ['', 'theme-matrix', 'theme-nord', 'theme-solar'];
let currentThemeIndex = 0;

function toggleTheme() {
    // Cycle theme
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];

    // Remove all theme classes
    document.body.classList.remove(...themes.filter(t => t));

    // Add new theme class if not empty (Standard)
    if (newTheme) {
        document.body.classList.add(newTheme);
    }

    // Save preference
    localStorage.setItem('userTheme', newTheme);
}

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('userTheme');
    if (saved) {
        document.body.classList.add(saved);
        currentThemeIndex = themes.indexOf(saved);
    }
});

// Lightbox Logic
function openLightbox(cardElement) {
    const lightbox = document.getElementById('diagram-lightbox');
    const container = document.getElementById('lightbox-wrapper');
    const svg = cardElement.querySelector('svg');

    if (svg && lightbox && container) {
        container.innerHTML = ''; // Clear previous
        const clone = svg.cloneNode(true);

        // Remove restrictive dimensions
        clone.removeAttribute('height');
        clone.removeAttribute('width');
        clone.style.maxWidth = '100%';
        clone.style.height = 'auto';

        container.appendChild(clone);
        lightbox.classList.add('active');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('diagram-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}
