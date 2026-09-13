document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadComponentIfEmpty("site-header", "components/navbar.html"),
        loadComponentIfEmpty("site-footer", "components/footer.html")
    ]);

    initializeMobileNavigation();
    highlightCurrentPage();
    updateCopyrightYear();
});

async function loadComponentIfEmpty(containerId, componentPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alreadyHasContent = container.children.length > 0 || container.textContent.trim().length > 0;
    if (alreadyHasContent) return;

    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Unable to load ${componentPath}`);
        container.innerHTML = await response.text();
    } catch (error) {
        console.error(`Shared component fallback failed: ${componentPath}`, error);
    }
}

function highlightCurrentPage() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-navigation a").forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function updateCopyrightYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) yearElement.textContent = new Date().getFullYear();
}

function initializeMobileNavigation() {
    const toggle = document.querySelector(".navigation-toggle");
    const panel = document.getElementById("navigation-panel");
    if (!toggle || !panel) return;

    const closeNavigation = () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        panel.classList.remove("is-open");
    };

    const openNavigation = () => {
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation");
        panel.classList.add("is-open");
    };

    toggle.addEventListener("click", () => {
        toggle.getAttribute("aria-expanded") === "true" ? closeNavigation() : openNavigation();
    });

    panel.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeNavigation();
    });

    document.addEventListener("click", (event) => {
        if (!toggle.contains(event.target) && !panel.contains(event.target)) closeNavigation();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNavigation();
            toggle.focus();
        }
    });

    window.matchMedia("(min-width: 1041px)").addEventListener("change", (event) => {
        if (event.matches) closeNavigation();
    });
}
