/* ============================================================
   UTILS.JS — Helper Functions for PB VelocityBoard 5.0
============================================================ */


/* ------------------------------------------------------------
   1. FORMAT DATE → “Feb 12, 2025”
------------------------------------------------------------ */
function formatDate(dateStr) {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


/* ------------------------------------------------------------
   2. PB TILE PULSE EFFECT
------------------------------------------------------------ */
function pulsePBTile(tileElement) {
    if (!tileElement) return;

    tileElement.classList.add("pbPulse");

    setTimeout(() => {
        tileElement.classList.remove("pbPulse");
    }, 1500);
}


/* ------------------------------------------------------------
   3. CONFETTI FOR NEW PB
------------------------------------------------------------ */
function triggerConfetti() {
    if (typeof confetti !== "function") return;

    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 }
    });
}


/* ------------------------------------------------------------
   4. PARSE TIME SAFELY
------------------------------------------------------------ */
function parseTime(value) {
    if (value === "" || value === null || value === undefined) return null;

    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}


/* ------------------------------------------------------------
   5. DEEP CLONE OBJECT
------------------------------------------------------------ */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}


/* ------------------------------------------------------------
   6. GENERATE UNIQUE ID
------------------------------------------------------------ */
function generateID() {
    return "id-" + Math.random().toString(36).substr(2, 9);
}


/* ------------------------------------------------------------
   7. CHECK IF EMPTY
------------------------------------------------------------ */
function isEmpty(val) {
    return val === "" || val === null || val === undefined;
}


/* ------------------------------------------------------------
   8. SMOOTH SCROLL TO ELEMENT
------------------------------------------------------------ */
function smoothScrollTo(el) {
    if (!el) return;

    el.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ------------------------------------------------------------
   9. TOAST MESSAGE SYSTEM
------------------------------------------------------------ */

function showToast(message, duration = 2000) {
    let toast = document.getElementById("toastBox");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toastBox";
        toast.style.position = "fixed";
        toast.style.bottom = "80px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.background = "rgba(0,0,0,0.75)";
        toast.style.color = "white";
        toast.style.padding = "12px 20px";
        toast.style.borderRadius = "8px";
        toast.style.fontSize = "14px";
        toast.style.zIndex = "9999";
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s ease";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, duration);
}

