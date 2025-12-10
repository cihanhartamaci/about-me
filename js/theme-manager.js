/**
 * Theme Manager
 * Handles Multi-Theme switching (Standard, Matrix, Nord, Solarized).
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    injectNavExtras();
});

function initTheme() {
    // Check local storage for saved theme
    const theme = localStorage.getItem('theme') || 'standard';
    applyTheme(theme);
}

function applyTheme(themeName) {
    // Remove all theme classes
    document.body.classList.remove('theme-matrix', 'theme-nord', 'theme-solar');

    // Apply new theme if not standard
    if (themeName !== 'standard') {
        document.body.classList.add(`theme-${themeName}`);
    }

    // Save preference
    localStorage.setItem('theme', themeName);


}

function injectNavExtras() {
    // Inject Theme Select Dropdown into .nav-links
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) {
        console.warn("Theme Manager: .nav-links not found, cannot inject controls.");
        return;
    }

    // Prevent duplicate injection
    if (document.getElementById('theme-select')) return;

    // Create container for the select (optional, but good for styling)
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginLeft = '10px';

    // Create Select Element
    const select = document.createElement('select');
    select.id = 'theme-select';
    select.title = "Select UI Theme";

    // Style the dropdown to match the dark aesthetic
    select.style.background = 'var(--bg-card)';
    select.style.color = 'var(--text-primary)';
    select.style.border = '1px solid var(--border-color)';
    select.style.borderRadius = '4px';
    select.style.padding = '4px 8px';
    select.style.fontSize = '0.8rem';
    select.style.fontFamily = 'var(--font-mono)';
    select.style.cursor = 'pointer';
    select.style.outline = 'none';

    // Options
    const themes = [
        { val: 'standard', label: 'Standard' },
        { val: 'matrix', label: 'Matrix' },
        { val: 'nord', label: 'Nord' },
        { val: 'solar', label: 'Solarized' }
    ];

    themes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.val;
        opt.textContent = t.label;
        select.appendChild(opt);
    });

    // Set initial value
    const currentTheme = localStorage.getItem('theme') || 'standard';
    select.value = currentTheme;

    // Event Listener
    select.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    container.appendChild(select);

    // Append to Nav
    const isList = navLinks.tagName === 'UL';
    if (isList) {
        const li = document.createElement('li');
        li.appendChild(container);
        navLinks.appendChild(li);
    } else {
        navLinks.appendChild(container);
    }
}
