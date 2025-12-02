/* ============================================================
   APP.JS — PB VelocityBoard 6.0 (FINAL VERSION)
   Core Logic: Athletes, Entries, PBs, Multi-Distance Input
============================================================ */


/* ------------------------------------------------------------
   GLOBAL STATE
------------------------------------------------------------ */
let athletes = JSON.parse(localStorage.getItem("pbv_athletes")) || [];
let currentAthleteID = null;


/* ------------------------------------------------------------
   SAVE & LOAD STORAGE
------------------------------------------------------------ */
function saveData() {
    localStorage.setItem("pbv_athletes", JSON.stringify(athletes));
}

function getAthlete(id) {
    return athletes.find(a => a.id === id);
}


/* ------------------------------------------------------------
   RENDER ATHLETE LIST (FIRST SCREEN)
------------------------------------------------------------ */
function renderAthleteList() {
    const list = document.getElementById("athleteList");
    list.innerHTML = "";

    if (athletes.length === 0) {
        list.innerHTML = `<p style="text-align:center; opacity:0.8;">
            No athletes added yet.
        </p>`;
        return;
    }

    athletes.forEach(a => {
        const card = document.createElement("div");
        card.className = "athleteCard";
        card.onclick = () => selectAthlete(a.id);

        card.innerHTML = `
            <div class="athleteEmoji">${a.emoji || "🏃"}</div>
            <div class="athleteName">${a.name}</div>
        `;

        list.appendChild(card);
    });
}


/* ------------------------------------------------------------
   SELECT ATHLETE → ENTER APP
------------------------------------------------------------ */
function selectAthlete(id) {
    currentAthleteID = id;
    goToHomeScreen();

    renderPBTiles();
    renderEntries();
}


/* ------------------------------------------------------------
   CREATE NEW ATHLETE
------------------------------------------------------------ */
function openAddAthleteModal() {
    document.getElementById("addAthleteModal").classList.remove("hiddenModal");
}

function closeAddAthleteModal() {
    document.getElementById("addAthleteModal").classList.add("hiddenModal");
}

function saveNewAthlete() {
    const name = document.getElementById("athleteNameInput").value.trim();
    const age = document.getElementById("athleteAgeInput").value.trim();
    const emoji = document.getElementById("athleteEmojiInput").value.trim();

    if (!name || !age) {
        showToast("Fill required fields");
        return;
    }

    const newAthlete = {
        id: uid(),
        name,
        age,
        emoji: emoji || "🏃",
        entries: [],
        pb: {}
    };

    athletes.push(newAthlete);
    saveData();

    closeAddAthleteModal();
    renderAthleteList();
}



/* ============================================================
   MULTI-DISTANCE ENTRY SYSTEM (M3 + D1 + R2)
============================================================ */

/* ---------- OPEN ADD ENTRY MODAL ---------- */
function openAddEntryModal() {
    document.getElementById("addEntryModal").classList.remove("hiddenModal");

    // Clear previous rows
    document.getElementById("distanceRowsContainer").innerHTML = "";

    // Add first distance row
    addDistanceRow();
}

/* ---------- CLOSE MODAL ---------- */
function closeAddEntryModal() {
    document.getElementById("addEntryModal").classList.add("hiddenModal");
}

/* ---------- ADD ONE ROW ---------- */
function addDistanceRow(distValue = "", timeValue = "") {
    const container = document.getElementById("distanceRowsContainer");
    const id = uid();

    const row = document.createElement("div");
    row.className = "distanceRowCard";
    row.setAttribute("data-row-id", id);

    row.innerHTML = `
        <label class="inputLabel">Distance (meters)</label>
        <input class="inputField" type="text"
               placeholder="e.g., 500"
               data-dist-row="${id}" value="${distValue}">

        <label class="inputLabel">Time (seconds)</label>
        <input class="inputField" type="number" step="0.01"
               placeholder="e.g., 48.25"
               data-time-row="${id}" value="${timeValue}">

        <button class="deleteRowBtn" onclick="deleteDistanceRow('${id}')">🗑 Delete</button>
    `;

    container.appendChild(row);
}

/* ---------- DELETE ONE ROW ---------- */
function deleteDistanceRow(id) {
    const row = document.querySelector(`[data-row-id="${id}"]`);
    if (row) row.remove();
}

/* ---------- SAVE MULTI-DISTANCE ENTRY ---------- */
function saveMultiDistanceEntry() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    const location = document.getElementById("entryLocationInput").value.trim();
    const date = document.getElementById("entryDateInput").value;

    if (!location || !date) {
        showToast("Enter location and date");
        return;
    }

    const rows = document.querySelectorAll(".distanceRowCard");
    if (rows.length === 0) {
        showToast("Add at least one distance");
        return;
    }

    const times = {};

    rows.forEach(row => {
        const id = row.getAttribute("data-row-id");
        const dist = document.querySelector(`[data-dist-row="${id}"]`).value.trim();
        const time = parseFloat(document.querySelector(`[data-time-row="${id}"]`).value);

        if (dist && time) times[dist] = time;
    });

    if (Object.keys(times).length === 0) {
        showToast("Enter valid distance & time");
        return;
    }

    const entry = {
        id: uid(),
        location,
        date,
        times
    };

    athlete.entries.push(entry);

    updatePBs(athlete);
    saveData();

    closeAddEntryModal();

    renderEntries();
    renderPBTiles();
    renderAnalyticsTab();

    showToast("Entry added");
}



/* ============================================================
   UPDATE PERSONAL BESTS
============================================================ */
function updatePBs(athlete) {
    const pbMap = {};

    athlete.entries.forEach(entry => {
        Object.keys(entry.times).forEach(dist => {
            const t = Number(entry.times[dist]);

            if (!pbMap[dist] || t < pbMap[dist].time) {
                pbMap[dist] = {
                    time: t,
                    location: entry.location,
                    date: entry.date
                };
            }
        });
    });

    athlete.pb = pbMap;
}



/* ============================================================
   RENDER PB TILES
============================================================ */
function renderPBTiles() {
    const athlete = getAthlete(currentAthleteID);
    const tilesBox = document.getElementById("pbTilesContainer");

    tilesBox.innerHTML = "";

    if (!athlete || Object.keys(athlete.pb).length === 0) {
        tilesBox.innerHTML = `<p style="text-align:center; opacity:0.7;">No PBs yet.</p>`;
        return;
    }

    const distances = sortDistances(Object.keys(athlete.pb));

    distances.forEach(dist => {
        const pb = athlete.pb[dist];

        const tile = document.createElement("div");
        tile.className = "entryCard";

        tile.innerHTML = `
            <div style="font-size:18px; font-weight:600;">${dist}m PB</div>
            <div style="font-size:24px; margin:6px 0;">${pb.time}s</div>
            <div style="opacity:0.7; font-size:14px;">
                ${pb.location} — ${formatDate(pb.date)}
            </div>`;
        
        tilesBox.appendChild(tile);
    });
}



/* ============================================================
   RENDER ENTRIES LIST
============================================================ */
function renderEntries() {
    const athlete = getAthlete(currentAthleteID);
    const container = document.getElementById("entriesContainer");

    container.innerHTML = "";

    if (!athlete || athlete.entries.length === 0) {
        container.innerHTML = `<p style="text-align:center; opacity:0.7;">No entries yet.</p>`;
        return;
    }

    const sorted = athlete.entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(entry => {
        const card = document.createElement("div");
        card.className = "entryCard";

        const distList = Object.keys(entry.times)
            .map(d => `${d}m: ${entry.times[d]}s`)
            .join(" • ");

        card.innerHTML = `
            <div><strong>${formatDate(entry.date)}</strong> — ${entry.location}</div>
            <div style="margin-top:6px;">${distList}</div>
        `;

        container.appendChild(card);
    });
}



/* ============================================================
   SETTINGS TAB
============================================================ */
function renderSettingsScreen() {
    const athlete = getAthlete(currentAthleteID);
    const section = document.getElementById("athleteSettingsSection");
    section.innerHTML = "";

    if (!athlete) return;

    section.innerHTML = `
        <div class="entryCard">
            <div><strong>Name:</strong> ${athlete.name}</div>
            <div><strong>Age:</strong> ${athlete.age}</div>
            <div><strong>Emoji:</strong> ${athlete.emoji}</div>
            <button class="dangerBtn" onclick="deleteAthlete()">Delete Athlete</button>
        </div>
    `;
}



/* ============================================================
   DELETE ATHLETE
============================================================ */
function deleteAthlete() {
    if (!confirm("Delete this athlete and all data?")) return;

    athletes = athletes.filter(a => a.id !== currentAthleteID);
    saveData();

    currentAthleteID = null;
    switchToAthleteSelect();
}



/* ============================================================
   RESET EVERYTHING
============================================================ */
function resetAllData() {
    if (!confirm("Reset ALL data? This cannot be undone.")) return;

    athletes = [];
    saveData();
    switchToAthleteSelect();
}
