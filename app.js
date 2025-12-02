/* ============================================================
   MULTI-DISTANCE ENTRY SYSTEM (M3 + D1)
============================================================ */

function addDistanceRow(distValue = "", timeValue = "") {
    const container = document.getElementById("distanceRowsContainer");

    const id = uid();

    const row = document.createElement("div");
    row.className = "distanceRowCard";
    row.setAttribute("data-row-id", id);

    row.innerHTML = `
        <label class="inputLabel">Distance (meters)</label>
        <input class="inputField" type="text" placeholder="e.g., 500" data-dist-row="${id}" value="${distValue}">

        <label class="inputLabel">Time (seconds)</label>
        <input class="inputField" type="number" step="0.01" placeholder="e.g., 48.25" data-time-row="${id}" value="${timeValue}">

        <button class="deleteRowBtn" onclick="deleteDistanceRow('${id}')">🗑 Delete</button>
    `;

    container.appendChild(row);
}

function deleteDistanceRow(id) {
    const row = document.querySelector(`[data-row-id="${id}"]`);
    if (row) row.remove();
}

function saveMultiDistanceEntry() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    const location = document.getElementById("entryLocationInput").value.trim();
    const date = document.getElementById("entryDateInput").value;

    if (!location || !date) {
        showToast("Enter location and date");
        return;
    }

    // Build the times object
    const times = {};
    const rows = document.querySelectorAll(".distanceRowCard");

    if (rows.length === 0) {
        showToast("Add at least one distance");
        return;
    }

    rows.forEach(row => {
        const id = row.getAttribute("data-row-id");
        const dist = document.querySelector(`[data-dist-row="${id}"]`).value.trim();
        const time = parseFloat(document.querySelector(`[data-time-row="${id}"]`).value);

        if (!dist || !time) return;

        times[dist] = time;
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
