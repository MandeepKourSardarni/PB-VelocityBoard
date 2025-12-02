/* ============================================================
   ATHLETES.JS — Multi-Athlete System for PB VelocityBoard 5.0
============================================================ */

let athletes = [];

/* ------------------------------------------------------------
   LOAD ATHLETES FROM LOCAL STORAGE
------------------------------------------------------------ */
function loadAthletes() {
    const saved = localStorage.getItem("PB_VB_ATHLETES");
    if (!saved) {
        athletes = [];
        return;
    }

    try {
        athletes = JSON.parse(saved);
    } catch (e) {
        console.error("Error loading athletes:", e);
        athletes = [];
    }
}

/* ------------------------------------------------------------
   SAVE ATHLETES TO LOCAL STORAGE
------------------------------------------------------------ */
function saveAthletes() {
    localStorage.setItem("PB_VB_ATHLETES", JSON.stringify(athletes));
}

/* ------------------------------------------------------------
   GET ATHLETE BY ID
------------------------------------------------------------ */
function getAthlete(id) {
    return athletes.find(a => a.id === id);
}

/* ------------------------------------------------------------
   RENDER ATHLETE LIST ON STARTUP
------------------------------------------------------------ */
function loadAthleteListUI() {
    loadAthletes(); // Load from storage

    const container = document.getElementById("athleteList");
    container.innerHTML = "";

    athletes.forEach(a => {
        const card = document.createElement("div");
        card.className = "athleteCard";
        card.onclick = () => loadAthlete(a.id);

        card.innerHTML = `
            <div class="athleteEmoji">${a.emoji || "🧒"}</div>
            <div>
                <strong>${a.name}</strong><br>
                <small>Age: ${a.age}</small>
            </div>
        `;

        container.appendChild(card);
    });
}

/* ------------------------------------------------------------
   OPEN ADD ATHLETE MODAL
------------------------------------------------------------ */
function openAthleteModal() {
    document.getElementById("athleteModal").style.display = "flex";
    document.getElementById("athleteNameInput").value = "";
    document.getElementById("athleteAgeInput").value = "";
    document.getElementById("athleteEmojiInput").value = "";
}

document.getElementById("addAthleteBtn").onclick = openAthleteModal;

/* ------------------------------------------------------------
   CLOSE ATHLETE MODAL
------------------------------------------------------------ */
function closeAthleteModal() {
    document.getElementById("athleteModal").style.display = "none";
}

/* ------------------------------------------------------------
   SAVE NEW ATHLETE
------------------------------------------------------------ */
function saveNewAthlete() {
    const name = document.getElementById("athleteNameInput").value.trim();
    const age = document.getElementById("athleteAgeInput").value.trim();
    const emoji = document.getElementById("athleteEmojiInput").value.trim() || "🧒";

    if (!name || !age) {
        showToast("Enter name and age.");
        return;
    }

    const newAthlete = {
        id: generateID(),
        name,
        age,
        emoji,
        entries: [],
        pb: {}
    };

    athletes.push(newAthlete);
    saveAthletes();

    closeAthleteModal();
    loadAthleteListUI();

    showToast("Athlete added.");
}

/* ------------------------------------------------------------
   SWITCH ATHLETE (Called by app.js)
------------------------------------------------------------ */
function switchAthlete(id) {
    loadAthlete(id);
}

