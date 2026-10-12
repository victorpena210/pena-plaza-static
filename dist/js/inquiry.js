// Only supported values may preselect a field; no visitor data is retained here.
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    for (const field of ["building", "request"]) {
        const select = document.getElementById(field);
        const value = params.get(field);
        if (select && value && [...select.options].some(option => option.value === value)) {
            select.value = value;
        }
    }
});
