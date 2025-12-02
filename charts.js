/* ============================================================
   CHARTS.JS — Trend Graph System for PB VelocityBoard 5.0
============================================================ */

let chartObjects = {}; // store all chart instances here


/* ------------------------------------------------------------
   RENDER THE TRENDS TAB
------------------------------------------------------------ */
function renderTrendsTab() {
    const tab = document.getElementById("trendsTab");
    tab.innerHTML = `<h2 style="color:#2ee7e7;">Performance Trends</h2>`;

    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    // Get all distances from all entries
    const distances = collectAllDistances(athlete);

    distances.forEach(dist => {
        const canvasID = "chart_" + dist;

        // Create chart container
        const container = document.createElement("div");
        container.style.margin = "25px 0";

        container.innerHTML = `
            <h3 style="color:#2ee7e7; margin-bottom:8px;">${dist}m Trend</h3>
            <canvas id="${canvasID}" height="180"></canvas>
        `;

        tab.appendChild(container);

        drawTrendChart(athlete, dist, canvasID);
    });
}


/* ------------------------------------------------------------
   GET A LIST OF ALL DISTANCES ATHLETE EVER RAN
------------------------------------------------------------ */
function collectAllDistances(athlete) {
    const set = new Set();

    athlete.entries.forEach(entry => {
        Object.keys(entry.times).forEach(dist => {
            set.add(dist);
        });
    });

    return Array.from(set).sort((a, b) => Number(a) - Number(b));
}


/* ------------------------------------------------------------
   BUILD AND DRAW THE TREND CHART
------------------------------------------------------------ */
function drawTrendChart(athlete, dist, canvasID) {
    const entries = athlete.entries
        .filter(e => e.times[dist] !== undefined)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (entries.length < 2) {
        // Not enough data
        const ctx = document.getElementById(canvasID).getContext("2d");
        ctx.font = "16px Segoe UI";
        ctx.fillStyle = "white";
        ctx.fillText("Not enough data to plot chart", 10, 40);
        return;
    }

    const labels = entries.map(e => formatDate(e.date));
    const times = entries.map(e => e.times[dist]);

    const ctx = document.getElementById(canvasID).getContext("2d");

    // Destroy previous chart (prevent duplicates)
    if (chartObjects[canvasID]) {
        chartObjects[canvasID].destroy();
    }

    chartObjects[canvasID] = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: `${dist}m Time (s)`,
                data: times,
                borderColor: "#2ee7e7",
                backgroundColor: "rgba(46, 231, 231, 0.3)",
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: "#2ee7e7",
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#eeeeee" },
                    grid: { color: "rgba(255,255,255,0.1)" }
                },
                y: {
                    ticks: { color: "#eeeeee" },
                    grid: { color: "rgba(255,255,255,0.1)" }
                }
            }
        }
    });
}

