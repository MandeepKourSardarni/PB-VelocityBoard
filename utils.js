/* ============================================================
   UTILS.JS — PB VelocityBoard 6.0 Utility Engine
   Includes: Sparkline rendering, analytics helpers, formatting
============================================================ */


/* ------------------------------------------------------------
   GENERATE UNIQUE ID
------------------------------------------------------------ */
function uid() {
    return "id-" + Math.random().toString(36).substr(2, 9);
}


/* ------------------------------------------------------------
   FORMAT DATE (YYYY-MM-DD → readable)
------------------------------------------------------------ */
function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}


/* ------------------------------------------------------------
   SHOW TOAST MESSAGE
------------------------------------------------------------ */
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.style.display = "block";
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.style.display = "none";
        }, 300);
    }, 1400);
}


/* ------------------------------------------------------------
   ANALYTICS HELPERS
------------------------------------------------------------ */

/* --- Extract last 5 times for a distance --- */
function getLastFiveTimes(entries, dist) {
    return entries
        .filter(e => e.times[dist] !== undefined)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(e => Number(e.times[dist]));
}

/* --- Calculate improvement % between first and latest --- */
function getImprovementPercent(entries, dist) {
    const list = entries
        .filter(e => e.times[dist] !== undefined)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (list.length < 2) return null;

    const first = Number(list[0].times[dist]);
    const latest = Number(list[list.length - 1].times[dist]);

    if (first <= 0) return null;

    const improvement = ((first - latest) / first) * 100;
    return improvement.toFixed(1);
}

/* --- Calculate consistency: 100% means stable timings --- */
function getConsistencyScore(entries, dist) {
    const times = entries
        .filter(e => e.times[dist] !== undefined)
        .map(e => Number(e.times[dist]));

    if (times.length < 3) return null;

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    // Lower deviation => higher consistency
    const score = Math.max(0, 100 - (stdDev / avg) * 100);
    return score.toFixed(0);
}

/* --- Get Season PB (last 12 months) --- */
function getSeasonPB(entries, dist) {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setFullYear(cutoff.getFullYear() - 1); // 12 months back

    const valid = entries.filter(e =>
        e.times[dist] !== undefined &&
        new Date(e.date) >= cutoff
    );

    if (valid.length === 0) return null;

    const best = valid.reduce((min, e) => Math.min(min, e.times[dist]), Infinity);
    return Number(best);
}

/* --- Sort distances: official → custom (O1) --- */
function sortDistances(distances) {
    const official = ["400", "500", "800", "1000", "1200", "1500"];

    return [
        ...official.filter(d => distances.includes(d)),
        ...distances.filter(d => !official.includes(d)).sort((a, b) => Number(a) - Number(b))
    ];
}


/* ------------------------------------------------------------
   SPARKLINE RENDERER (tiny charts)
------------------------------------------------------------ */
function drawSparkline(canvas, data, color = "#2ee7e7") {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!data || data.length === 0) return;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const step = w / (data.length - 1);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    data.forEach((value, i) => {
        const x = i * step;
        const y = h - ((value - min) / range) * h;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

