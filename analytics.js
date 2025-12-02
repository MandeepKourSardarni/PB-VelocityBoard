/* ============================================================
   ANALYTICS.JS — PB VelocityBoard 6.0
   Generates Analytics Cards with:
   🔥 Improvement % 
   🎯 Consistency 
   🏅 Season PB 
   👑 All-time PB 
   📈 Sparkline Trends
============================================================ */


/* ------------------------------------------------------------
   RENDER ANALYTICS TAB
------------------------------------------------------------ */
function renderAnalyticsTab() {
    const container = document.getElementById("analyticsCardsContainer");
    container.innerHTML = "";

    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    // Collect all distances the athlete has ever raced
    let distances = [];

    athlete.entries.forEach(entry => {
        Object.keys(entry.times).forEach(dist => {
            if (!distances.includes(dist)) distances.push(dist);
        });
    });

    // Sort: official first, then custom
    distances = sortDistances(distances);

    // Build a card per distance
    distances.forEach(dist => {
        const card = buildAnalyticsCard(athlete, dist);
        container.appendChild(card);
    });
}


/* ------------------------------------------------------------
   BUILD ANALYTICS CARD FOR ONE DISTANCE
------------------------------------------------------------ */
function buildAnalyticsCard(athlete, dist) {
    const card = document.createElement("div");
    card.className = "analyticsCard";

    const entries = athlete.entries.filter(e => e.times[dist] !== undefined);
    if (entries.length === 0) return card;

    // Extract analytics
    const improvement = getImprovementPercent(athlete.entries, dist);
    const consistency = getConsistencyScore(athlete.entries, dist);
    const seasonPB = getSeasonPB(athlete.entries, dist);
    const allPB = athlete.pb[dist] ? athlete.pb[dist].time : null;
    const lastFive = getLastFiveTimes(athlete.entries, dist);

    // HEADER
    const title = document.createElement("div");
    title.className = "analyticsTitle";
    title.innerHTML = `${dist}m 🏃`;
    card.appendChild(title);

    // IMPROVEMENT
    const improvementRow = document.createElement("div");
    improvementRow.className = "analyticsRow";
    improvementRow.innerHTML = improvement !== null 
        ? `🔥 Improvement: <strong>${improvement}%</strong>`
        : `🔥 Improvement: <span style="opacity:0.6;">Not enough data</span>`;
    card.appendChild(improvementRow);

    // CONSISTENCY
    const consistencyRow = document.createElement("div");
    consistencyRow.className = "analyticsRow";
    consistencyRow.innerHTML = consistency !== null
        ? `🎯 Consistency: <strong>${consistency}%</strong>`
        : `🎯 Consistency: <span style="opacity:0.6;">Not enough data</span>`;
    card.appendChild(consistencyRow);

    // SEASON PB
    const seasonRow = document.createElement("div");
    seasonRow.className = "analyticsRow";
    seasonRow.innerHTML = seasonPB !== null
        ? `🏅 Season PB: <strong>${seasonPB}s</strong>`
        : `🏅 Season PB: <span style="opacity:0.6;">No recent data</span>`;
    card.appendChild(seasonRow);

    // ALL-TIME PB
    const allPBRow = document.createElement("div");
    allPBRow.className = "analyticsRow";
    allPBRow.innerHTML = allPB !== null
        ? `👑 All-time PB: <strong>${allPB}s</strong>`
        : `👑 All-time PB: <span style="opacity:0.6;">No PB yet</span>`;
    card.appendChild(allPBRow);

    // LAST FIVE TIMES
    const lastFiveRow = document.createElement("div");
    lastFiveRow.className = "analyticsRow";
    lastFiveRow.innerHTML = lastFive.length > 0
        ? `📈 Last 5: ${lastFive.join(" → ")}`
        : `📈 Last 5: <span style="opacity:0.6;">No data</span>`;
    card.appendChild(lastFiveRow);

    // SPARKLINE (Tiny chart)
    const sparkCanvas = document.createElement("canvas");
    sparkCanvas.className = "sparklineCanvas";

    // MUST SET WIDTH/HEIGHT in JS for crispness
    sparkCanvas.width = 240;
    sparkCanvas.height = 40;

    card.appendChild(sparkCanvas);

    // Draw sparkline
    drawSparkline(sparkCanvas, lastFive, "#2ee7e7");

    return card;
}
