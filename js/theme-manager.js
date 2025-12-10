/**
 * Theme Manager & System Status Footer
 * Handles Matrix Mode toggle and injecting the status footer.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    injectStatusFooter();
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
        btn.innerHTML = isMatrix ? '<i class="fas fa-terminal"></i>' : '<i class="fas fa-moon"></i>';
        btn.title = isMatrix ? "Disable Matrix Mode" : "Enable Matrix Mode";
    }
}

function injectStatusFooter() {
    const footer = document.createElement('div');
    footer.className = 'sys-footer';

    // Random latency generator
    const latDB = Math.floor(Math.random() * 20) + 10;
    const latAPI = Math.floor(Math.random() * 50) + 20;

    footer.innerHTML = `
        <div class="status-group">
            <div class="status-item" title="Database Connection: Active">
                <div class="status-dot"></div>
                <span>DB: ${latDB}ms</span>
            </div>
            <div class="status-item" title="API Gateway: Operational">
                <div class="status-dot"></div>
                <span>API: ${latAPI}ms</span>
            </div>
            <div class="status-item" title="EDI Translators: Online">
                <div class="status-dot"></div>
                <span>EDI-X12</span>
            </div>
        </div>
        <div class="status-group">
            <div class="status-item">
                <span>V.2.4.0-STABLE</span>
            </div>
        </div>
    `;

    document.body.appendChild(footer);

    // Adjust body padding so footer doesn't hide content
    document.body.style.paddingBottom = "40px";
}

function injectNavExtras() {
    // Inject "Vault" link and "Theme Toggle" into .nav-links
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Check if Vault already exists (to prevent dupes if hardcoded later)
    if (!document.querySelector('a[href="vault.html"]')) {
        const vaultLink = document.createElement('a');
        vaultLink.href = 'vault.html';
        vaultLink.className = 'nav-link';
        vaultLink.textContent = 'Vault';

        // Insert before Contact or Dashboard
        const contactLink = document.querySelector('a[href="contact.html"]');
        if (contactLink) {
            navLinks.insertBefore(vaultLink, contactLink);
        } else {
            navLinks.appendChild(vaultLink);
        }
    }

    // Theme Toggle
    if (!document.getElementById('btn-theme-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'btn-theme-toggle';
        toggleBtn.className = 'nav-link';
        toggleBtn.style.background = 'transparent';
        toggleBtn.style.border = 'none';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontSize = '1rem';
        toggleBtn.onclick = toggleTheme;

        const isMatrix = document.body.classList.contains('matrix-mode');
        toggleBtn.innerHTML = isMatrix ? '<i class="fas fa-terminal"></i>' : '<i class="fas fa-moon"></i>';
        toggleBtn.title = isMatrix ? "Disable Matrix Mode" : "Enable Matrix Mode";

        navLinks.appendChild(toggleBtn);
    }
}
