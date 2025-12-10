
const fs = require('fs');
const files = {
    theme: 'js/theme-manager.js',
    style: 'style.css',
    vault: 'vault.html'
};

function verify() {
    console.log("Verifying Cleanup...");

    // 1. Vault HTML should NOT exist
    if (!fs.existsSync(files.vault)) {
        console.log("PASS: vault.html deleted");
    } else {
        console.error("FAIL: vault.html still exists");
    }

    // 2. Theme Manager should NOT have footer injection
    const themeContent = fs.readFileSync(files.theme, 'utf8');
    if (!themeContent.includes('injectStatusFooter') && !themeContent.includes('vault.html')) {
        console.log("PASS: theme-manager.js cleaned");
    } else {
        console.error("FAIL: theme-manager.js still contains logic");
    }

    // 3. Style should NOT have .sys-footer
    const styleContent = fs.readFileSync(files.style, 'utf8');
    if (!styleContent.includes('.sys-footer')) {
        console.log("PASS: style.css cleaned");
    } else {
        console.error("FAIL: style.css still contains footer styles");
    }
}

verify();
