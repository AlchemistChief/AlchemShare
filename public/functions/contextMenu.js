// functions/contextMenu.js

// ────────── Context Menu Handler ──────────

let holdTimer = null;
const contextMenu = document.querySelector(".card");

if (contextMenu) contextMenu.style.display = "none";

function showContextMenu(x, y, targetElement) {
    if (!contextMenu) return;

    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth - 10;
    }
    if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight - 10;
    }

    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.display = "block";
    contextMenu.dataset.targetId = targetElement?.dataset.id || "";

    document.addEventListener("click", hideContextMenu, { once: true });
}

function hideContextMenu() {
    if (!contextMenu) return;
    contextMenu.style.display = "none";
}

export function initContextMenu() {
    const fileRows = document.querySelectorAll(".ftp-row");

    fileRows.forEach((row) => {
        row.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showContextMenu(e.pageX, e.pageY, row);
        });

        row.addEventListener("touchstart", (e) => {
            holdTimer = setTimeout(() => {
                const touch = e.touches[0];
                showContextMenu(touch.pageX, touch.pageY, row);
            }, 500);
        });

        row.addEventListener("touchend", () => {
            if (holdTimer) clearTimeout(holdTimer);
        });

        row.addEventListener("touchmove", () => {
            if (holdTimer) clearTimeout(holdTimer);
        });
    });
}
