
const fs = require('fs');
const path = require('path');

const root = './';
const files = {
    vault: 'vault.html',
    patterns: 'patterns.html',
    style: 'style.css',
    theme: 'js/theme-manager.js'
};

function verify() {
    console.log("Verifying Phase 2 Features...");

    // 1. Check Vault
    if (fs.existsSync(files.vault)) {
        console.log("PASS: vault.html exists");
    } else {
        console.error("FAIL: vault.html missing");
    }

    // 2. Check Patterns for Mermaid
    const patternsContent = fs.readFileSync(files.patterns, 'utf8');
    if (patternsContent.includes('class="mermaid"')) {
        console.log("PASS: patterns.html contains mermaid diagrams");
    } else {
        console.error("FAIL: patterns.html missing mermaid class");
    }

    // 3. Check Style for Matrix
    const styleContent = fs.readFileSync(files.style, 'utf8');
    if (styleContent.includes('matrix-mode')) {
        console.log("PASS: style.css contains matrix-mode vars");
    } else {
        console.error("FAIL: style.css missing matrix-mode");
    }

    // 4. Check Theme Manager
    if (fs.existsSync(files.theme)) {
        console.log("PASS: theme-manager.js exists");
    } else {
        console.error("FAIL: theme-manager.js missing");
    }
}

verify();
