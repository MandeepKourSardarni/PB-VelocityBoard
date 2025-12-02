/* ============================================================
   APP.JS — Core Logic for PB VelocityBoard 5.0
============================================================ */

let currentAthleteID = null;
let currentEditingEntryID = null;

/* ------------------------------------------------------------
   LOAD ATHLETE DATA ON SELECTION
------------------------------------------------------------ */
function loadAthlete(athleteID) {
    currentAthleteID = athleteID;

    const athlete = getAthlete(athleteID);
    if (!athlete) return;

    document.getElementById("athleteSelectScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";

    document.getElementById("currentAthleteName").textContent =
        athlete.name + " " + (athlete.emoji || "");
    document.getElementById("currentAthleteAge").textContent =
        "Age: " + athlete.age;

    renderAll();
}


/* ------------------------------------------------------------
   RENDER EVERYTHING (PB tiles, entries, custom PBs)
------------------------------------------------------------ */
function renderAll() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    updatePBTiles(athlete);
    updateCustomPBs(athlete);
    renderEntries(athlete);
}


/* ------------------------------------------------------------
   UPDATE PB TILES (Official distances)
------------------------------------------------------------ */
function updatePBTiles(athlete) {
    const container = document.getElementById("pbTiles");
    container.innerHTML = "";

    const officialDistances = ["400", "500", "800", "1000", "1200", "1500"];

    officialDistances.forEach(dist => {
        const pb = athlete.pb[dist];

        const tile = document.createElement("div");
        tile.className = "pbTile";
        tile.id = `pb-${dist}`;

        tile.innerHTML = `
            <div class="distance">${dist}m</div>
            <div class="time">${pb ? pb.time + "s" : "--"}</div>
            <div class="meta">
                ${pb ? pb.location : ""}<br>
                ${pb ? formatDate(pb.date) : ""}
            </div>
        `;

        container.appendChild(tile);
    });
}


/* ------------------------------------------------------------
   UPDATE CUSTOM DISTANCE PBs
------------------------------------------------------------ */
function updateCustomPBs(athlete) {
    const container = document.getElementById("customPBList");
    container.innerHTML = "";

    Object.keys(athlete.pb).forEach(dist => {
        if (["400","500","800","1000","1200","1500"].includes(dist)) return;

        const pb = athlete.pb[dist];

        const item = document.createElement("div");
        item.className = "customPBItem";

        item.innerHTML = `
            <strong>${dist}m:</strong> ${pb.time}s<br>
            <small>${pb.location} • ${formatDate(pb.date)}</small>
        `;

        container.appendChild(item);
    });
}


/* ------------------------------------------------------------
   RENDER ENTRY HISTORY
------------------------------------------------------------ */
function renderEntries(athlete) {
    const container = document.getElementById("entryList");
    container.innerHTML = "";

    athlete.entries.forEach(entry => {
        const card = document.createElement("div");
        card.className = "entryCard";

        card.innerHTML = `
            <div><strong>${entry.location}</strong></div>
            <div>${formatDate(entry.date)}</div>
            <div>${formatEntryTimes(entry)}</div>

            <div class="editDeleteRow">
                <span class="editBtn" onclick="editEntry('${entry.id}')">✏️ Edit</span>
                <span class="deleteBtn" onclick="deleteEntry('${entry.id}')">🗑 Delete</span>
            </div>
        `;

        container.appendChild(card);
    });
}


/* Helper to format times into readable text */
function formatEntryTimes(entry) {
    let html = "";

    Object.keys(entry.times).forEach(dist => {
        html += `${dist}m: ${entry.times[dist]}s<br>`;
    });

    return html;
}


/* ------------------------------------------------------------
   OPEN ENTRY MODAL
------------------------------------------------------------ */
function openEntryModal(editID = null) {
    currentEditingEntryID = editID;

    document.getElementById("entryModal").style.display = "flex";

    if (editID) {
        loadEntryIntoModal(editID);
    } else {
        clearEntryModal();
    }
}

function closeEntryModal() {
    document.getElementById("entryModal").style.display = "none";
}


/* ------------------------------------------------------------
   CLEAR MODAL FOR NEW ENTRY
------------------------------------------------------------ */
function clearEntryModal() {
    document.getElementById("entryLocation").value = "";
    document.getElementById("entryDate").value = "";

    ["400","500","800","1000","1200","1500"].forEach(id => {
        document.getElementById("t" + id).value = "";
    });

    document.getElementById("customDistanceInput").value = "";
    document.getElementById("customDistanceTime").value = "";
}


/* ------------------------------------------------------------
   LOAD EXISTING ENTRY FOR EDITING
------------------------------------------------------------ */
function loadEntryIntoModal(entryID) {
    const athlete = getAthlete(currentAthleteID);
    const entry = athlete.entries.find(e => e.id === entryID);

    if (!entry) return;

    document.getElementById("entryLocation").value = entry.location;
    document.getElementById("entryDate").value = entry.date;

    ["400","500","800","1000","1200","1500"].forEach(dist => {
        document.getElementById("t" + dist).value =
            entry.times[dist] ?? "";
    });

    // Load custom distances (only first one)
    const custom = Object.keys(entry.times).find(k =>
        !["400","500","800","1000","1200","1500"].includes(k)
    );

    if (custom) {
        document.getElementById("customDistanceInput").value = custom;
        document.getElementById("customDistanceTime").value = entry.times[custom];
    }
}


/* ------------------------------------------------------------
   SAVE ENTRY (NEW OR EDIT)
------------------------------------------------------------ */
function saveEntry() {
    const athlete = getAthlete(currentAthleteID);

    const location = document.getElementById("entryLocation").value.trim();
    const date = document.getElementById("entryDate").value;

    if (!location || !date) {
        showToast("Enter location and date.");
        return;
    }

    const times = {};
    ["400","500","800","1000","1200","1500"].forEach(dist => {
        const val = parseTime(document.getElementById("t" + dist).value);
        if (val !== null) times[dist] = val;
    });

    const customDist = document.getElementById("customDistanceInput").value.trim();
    const customTime = parseTime(document.getElementById("customDistanceTime").value);

    if (customDist && customTime !== null) {
        times[customDist] = customTime;
    }

    if (Object.keys(times).length === 0) {
        showToast("Enter at least one time.");
        return;
    }

    if (currentEditingEntryID) {
        // EDIT existing entry
        const entry = athlete.entries.find(e => e.id === currentEditingEntryID);
        entry.location = location;
        entry.date = date;
        entry.times = times;

        showToast("Entry updated.");
        currentEditingEntryID = null;
    } else {
        // NEW ENTRY
        const newEntry = {
            id: generateID(),
            location,
            date,
            times
        };

        athlete.entries.push(newEntry);
    }

    updatePBs(athlete);

    saveAthletes();
    renderAll();
    closeEntryModal();
}


/* ------------------------------------------------------------
   UPDATE PERSONAL BESTS
------------------------------------------------------------ */
function updatePBs(athlete) {
    athlete.pb = {};

    athlete.entries.forEach(entry => {
        Object.keys(entry.times).forEach(dist => {
            const time = entry.times[dist];

            if (!athlete.pb[dist] || time < athlete.pb[dist].time) {
                athlete.pb[dist] = {
                    time,
                    location: entry.location,
                    date: entry.date
                };
            }
        });
    });
}


/* ------------------------------------------------------------
   EDIT ENTRY
------------------------------------------------------------ */
function editEntry(entryID) {
    openEntryModal(entryID);
}


/* ------------------------------------------------------------
   DELETE ENTRY
------------------------------------------------------------ */
function deleteEntry(entryID) {
    const athlete = getAthlete(currentAthleteID);

    athlete.entries = athlete.entries.filter(e => e.id !== entryID);

    updatePBs(athlete);
    saveAthletes();
    renderAll();

    showToast("Entry deleted.");
}


/* ------------------------------------------------------------
   UNDO LAST ENTRY
------------------------------------------------------------ */
function undoLastEntry() {
    const athlete = getAthlete(currentAthleteID);

    if (athlete.entries.length === 0) {
        showToast("No entries to undo.");
        return;
    }

    athlete.entries.pop();
    updatePBs(athlete);
    saveAthletes();
    renderAll();

    showToast("Last entry undone.");
}


/* ------------------------------------------------------------
   RESET ALL DATA FOR ATHLETE
------------------------------------------------------------ */
function resetAllData() {
    if (!confirm("Are you sure? This deletes all entries and PBs.")) return;

    const athlete = getAthlete(currentAthleteID);

    athlete.entries = [];
    athlete.pb = {};

    saveAthletes();
    renderAll();

    showToast("All data reset.");
}


/* ------------------------------------------------------------
   INIT: Show Athlete Select Screen
------------------------------------------------------------ */
window.onload = function () {
    document.getElementById("mainApp").style.display = "none";
    loadAthleteListUI();
};

