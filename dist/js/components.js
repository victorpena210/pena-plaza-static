document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.navigation-toggle');
    const panel = document.getElementById('navigation-panel');
    const es = document.documentElement.lang === 'es';
    if (toggle && panel) {
        document.documentElement.classList.add('navigation-ready');
        const close = (restoreFocus = false) => {
            const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', es ? 'Abrir menú' : 'Open navigation');
            panel.classList.remove('is-open');
            if (restoreFocus && wasOpen) toggle.focus();
        };
        toggle.addEventListener('click', () => {
            if (toggle.getAttribute('aria-expanded') === 'true') close();
            else {
                toggle.setAttribute('aria-expanded', 'true');
                toggle.setAttribute('aria-label', es ? 'Cerrar menú' : 'Close navigation');
                panel.classList.add('is-open');
            }
        });
        panel.addEventListener('click', event => { if (event.target.closest('a')) close(); });
        document.addEventListener('click', event => { if (!toggle.contains(event.target) && !panel.contains(event.target)) close(); });
        document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
        document.addEventListener('focusin', event => { if (!toggle.contains(event.target) && !panel.contains(event.target)) close(); });
        window.matchMedia('(min-width: 1041px)').addEventListener('change', event => { if (event.matches) close(); });
    }
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-navigation a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === current || (/^building-[12]\.html$/.test(current) && href === 'location.html')) {
            link.classList.add('active');
            if (href === current) link.setAttribute('aria-current', 'page');
        }
    });
    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
});
