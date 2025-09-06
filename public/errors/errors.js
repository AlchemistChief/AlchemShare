window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('errorMessage');
    if (errorMsg) {
        const el = document.getElementById('error-message');
        if (el) el.textContent = `Error: ${errorMsg}`;
    }
});