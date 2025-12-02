/* ============================================================
   APP.JS — PB VelocityBoard 6.0
   Core Logic: Athletes, Entries, PBs, UI Rendering
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
        list.innerHTML = `<p style="text-align:center; opacity:0.8;">No athletes added yet.</p>`;
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
        pb: {}  // PB will populate dynamically
    };

    athletes.push(newAthlete);
    saveData();

    closeAddAthleteModal();
    renderAthleteList();
}


/* ------------------------------------------------------------
   ADD RACE ENTRY
------------------------------------------------------------ */
function openAddEntryModal() {
    document.getElementById("addEntryModal").classList.remove("hiddenModal");
}

function closeAddEntryModal() {
    document.getElementById("addEntryModal").classList.add("hiddenModal");
}

function saveNewEntry() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    const location = document.getElementById("entryLocationInput").value.trim();
    const date = document.getElementById("entryDateInput").value;
    const dist = document.getElementById("entryDistanceInput").value.trim();
    const time = parseFloat(document.getElementById("entryTimeInput").value.trim());

    if (!location || !date || !dist || !time) {
        showToast("Fill all fields");
        return;
    }

    const entry = {
        id: uid(),
        location,
        date,
        times: { [dist]: time }
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


/* ------------------------------------------------------------
   UPDATE PERSONAL BESTS
------------------------------------------------------------ */
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


/* ------------------------------------------------------------
   RENDER PB TILES
------------------------------------------------------------ */
function renderPBTiles() {
    const athlete = getAthlete(currentAthleteID);
    const container = document.getElementById("homeTab");
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
        tile.className = "entryCard";  // visually good for PB tiles

        tile.innerHTML = `
            <div style="font-size:18px; font-weight:600;">${dist}m PB</div>
            <div style="font-size:24px; margin:6px 0;">${pb.time}s</div>
            <div style="opacity:0.7; font-size:14px;">
                ${pb.location} — ${formatDate(pb.date)}
            </div>
        `;

        tilesBox.appendChild(tile);
    });
}


/* ------------------------------------------------------------
   RENDER ENTRIES LIST
------------------------------------------------------------ */
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

        const distances = Object.keys(entry.times)
            .map(d => `${d}m: ${entry.times[d]}s`)
            .join(" • ");

        card.innerHTML = `
            <div><strong>${formatDate(entry.date)}</strong> — ${entry.location}</div>
            <div style="margin-top:6px;">${distances}</div>
        `;

        container.appendChild(card);
    });
}


/* ------------------------------------------------------------
   SETTINGS TAB RENDER
------------------------------------------------------------ */
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


/* ------------------------------------------------------------
   DELETE ATHLETE
------------------------------------------------------------ */
function deleteAthlete() {
    if (!confirm("Delete this athlete and all data?")) return;

    athletes = athletes.filter(a => a.id !== currentAthleteID);
    saveData();

    currentAthleteID = null;
    switchToAthleteSelect();
}


/* ------------------------------------------------------------
   RESET ALL DATA
------------------------------------------------------------ */
function resetAllData() {
    if (!confirm("Reset ALL data? This cannot be undone.")) return;

    athletes = [];
    saveData();
    switchToAthleteSelect();
}
