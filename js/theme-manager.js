/**
 * Theme Manager
 * Handles Matrix Mode toggle.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    injectNavExtras();
});

function initTheme() {
    // Check local storage
    const theme = localStorage.getItem('theme');
    if (theme === 'matrix') {
        document.body.classList.add('matrix-mode');
    }
}

function toggleTheme() {
    const isMatrix = document.body.classList.toggle('matrix-mode');
    localStorage.setItem('theme', isMatrix ? 'matrix' : 'default');

    // Update button icon/text if it exists
    const btn = document.getElementById('btn-theme-toggle');
    if (btn) {
        updateToggleButton(btn, isMatrix);
    }
}

function updateToggleButton(btn, isMatrix) {
    // Ensure visibility by forcing inline styles high contrast
    btn.innerHTML = isMatrix ? '<i class="fas fa-terminal"></i>' : '<i class="fas fa-moon"></i>';
    btn.title = isMatrix ? "Disable Matrix Mode" : "Enable Matrix Mode";
    btn.style.color = isMatrix ? '#00ff00' : 'var(--text-secondary)';
}

function injectNavExtras() {
    // Inject "Theme Toggle" into .nav-links
    // Try to find the container. 
    // Most pages: .nav-links (div) inside .top-nav
    // Dashboard: .nav-links (ul) inside .navbar

    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) {
        console.warn("Theme Manager: .nav-links not found, cannot inject toggle.");
        return;
    }

    // Theme Toggle
    if (!document.getElementById('btn-theme-toggle')) {
        // Create list item for Dashboard (ul) or direct link for others (div)
        const isList = navLinks.tagName === 'UL';

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'btn-theme-toggle';
        toggleBtn.className = 'nav-link';
        // Reset button styles to match links
        toggleBtn.style.background = 'transparent';
        toggleBtn.style.border = 'none';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontSize = '1rem';
        toggleBtn.style.padding = '0 1rem'; // Match nav-link padding
        toggleBtn.style.display = 'flex';
        toggleBtn.style.alignItems = 'center';
        toggleBtn.onclick = toggleTheme;

        const isMatrix = document.body.classList.contains('matrix-mode');
        updateToggleButton(toggleBtn, isMatrix);

        if (isList) {
            const li = document.createElement('li');
            li.appendChild(toggleBtn);
            navLinks.appendChild(li);
        } else {
            navLinks.appendChild(toggleBtn);
        }
    }
}
