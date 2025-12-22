// i18n.js - Lightweight Internationalization Library
(function (window) {
    'use strict';

    const i18n = {
        currentLang: 'en',
        translations: {},
        fallbackLang: 'en',

        // Initialize i18n
        init: function (defaultLang = 'en', basePath = '/translations/') {
            this.basePath = basePath;
            this.fallbackLang = defaultLang;

            // Get saved language or browser language
            const savedLang = localStorage.getItem('preferredLanguage');
            const browserLang = navigator.language.split('-')[0];

            // Determine initial language
            const supportedLangs = ['en', 'tr', 'es', 'it', 'ru', 'zh'];
            let initialLang = defaultLang;

            if (savedLang && supportedLangs.includes(savedLang)) {
                initialLang = savedLang;
            } else if (supportedLangs.includes(browserLang)) {
                initialLang = browserLang;
            }

            return this.loadLanguage(initialLang);
        },

        // Load translation file
        loadLanguage: function (lang) {
            return fetch(this.basePath + lang + '.json')
                .then(response => {
                    if (!response.ok) throw new Error('Translation file not found');
                    return response.json();
                })
                .then(translations => {
                    this.translations[lang] = translations;
                    this.currentLang = lang;
                    localStorage.setItem('preferredLanguage', lang);
                    this.applyTranslations();
                    this.updateHtmlLang();
                    return lang;
                })
                .catch(error => {
                    console.warn(`Failed to load ${lang}.json, falling back to ${this.fallbackLang}`, error);
                    if (lang !== this.fallbackLang) {
                        return this.loadLanguage(this.fallbackLang);
                    }
                });
        },

        // Get translation by key
        t: function (key, lang = null) {
            lang = lang || this.currentLang;
            const keys = key.split('.');
            let value = this.translations[lang];

            for (let k of keys) {
                if (value && value.hasOwnProperty(k)) {
                    value = value[k];
                } else {
                    // Fallback to default language
                    value = this.translations[this.fallbackLang];
                    for (let k of keys) {
                        if (value && value.hasOwnProperty(k)) {
                            value = value[k];
                        } else {
                            return key; // Return key if not found
                        }
                    }
                    break;
                }
            }

            return value || key;
        },

        // Apply translations to DOM
        applyTranslations: function () {
            // Translate elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(elem => {
                const key = elem.getAttribute('data-i18n');
                const translation = this.t(key);

                if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') {
                    elem.placeholder = translation;
                } else {
                    elem.textContent = translation;
                }
            });

            // Translate elements with data-i18n-html attribute (for HTML content)
            document.querySelectorAll('[data-i18n-html]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-html');
                elem.innerHTML = this.t(key);
            });

            // Translate title attribute
            document.querySelectorAll('[data-i18n-title]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-title');
                elem.title = this.t(key);
            });

            // Translate placeholder attribute
            document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-placeholder');
                elem.placeholder = this.t(key);
            });

            // Translate aria-label attribute
            document.querySelectorAll('[data-i18n-aria]').forEach(elem => {
                const key = elem.getAttribute('data-i18n-aria');
                elem.setAttribute('aria-label', this.t(key));
            });
        },

        // Update HTML lang attribute
        updateHtmlLang: function () {
            document.documentElement.lang = this.currentLang;
        },

        // Change language
        changeLanguage: function (lang) {
            if (this.translations[lang]) {
                this.currentLang = lang;
                localStorage.setItem('preferredLanguage', lang);
                this.applyTranslations();
                this.updateHtmlLang();

                // Trigger custom event
                window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
            } else {
                return this.loadLanguage(lang);
            }
        },

        // Get current language
        getCurrentLanguage: function () {
            return this.currentLang;
        },

        // Get available languages
        getAvailableLanguages: function () {
            return Object.keys(this.translations);
        }
    };

    // Expose to window
    window.i18n = i18n;

    // Auto-initialize language selector if exists
    document.addEventListener('DOMContentLoaded', function () {
        const langSelector = document.getElementById('language-selector');
        if (langSelector) {
            langSelector.value = i18n.getCurrentLanguage();
            langSelector.addEventListener('change', function (e) {
                i18n.changeLanguage(e.target.value);
            });
        }
    });

})(window);
