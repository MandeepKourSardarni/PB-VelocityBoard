/* ============================================================
   THEME.JS — PB VelocityBoard 6.0
   Handles: Tab switching, screen visibility, page flow
============================================================ */


/* ------------------------------------------------------------
   SWITCH BETWEEN TABS
------------------------------------------------------------ */
function switchTab(tabName) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hiddenScreen");
        screen.classList.remove("activeScreen");
       if (tabName === "homeTab") {
          populateAthleteDropdown();
}

    });

    // Show selected tab
    const tab = document.getElementById(tabName);
    tab.classList.remove("hiddenScreen");
    tab.classList.add("activeScreen");

    // Trigger tab-specific updates
    if (tabName === "homeTab") {
        renderPBTiles();
        renderEntries();
    }

    if (tabName === "settingsTab") {
        renderSettingsScreen();
    }

    if (tabName === "analyticsTab") {
        renderAnalyticsTab();
    }

    if (tabName === "exportTab") {
        renderExportTab();
    }
}


/* ------------------------------------------------------------
   OPEN HOME TAB AFTER ATHLETE SELECTED
------------------------------------------------------------ */
function goToHomeScreen() {
    document.getElementById("athleteSelectScreen").classList.add("hiddenScreen");
    document.getElementById("athleteSelectScreen").classList.remove("activeScreen");

    switchTab("homeTab");
}

/* ------------------------------------------------------------
   RETURN TO ATHLETE SELECTION (OPTIONAL FEATURE)
------------------------------------------------------------ */
function backToAthleteSelect() {
    // Hide all tabs
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.add("hiddenScreen");
        s.classList.remove("activeScreen");
    });

    // Show main selection screen
    const sel = document.getElementById("athleteSelectScreen");
    sel.classList.remove("hiddenScreen");
    sel.classList.add("activeScreen");
}


/* ------------------------------------------------------------
   INITIALIZE FIRST SCREEN
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    // Athlete selection screen is shown first
    switchToAthleteSelect();
});


/* ------------------------------------------------------------
   HANDLER — START AT ATHLETE SELECT SCREEN
------------------------------------------------------------ */
function switchToAthleteSelect() {
    document.querySelectorAll(".screen").forEach(s => {
       s.classList.add("hiddenScreen");
       s.classList.remove("activeScreen");
    });

    const sel = document.getElementById("athleteSelectScreen");
    sel.classList.remove("hiddenScreen");
    sel.classList.add("activeScreen");

    renderAthleteList();
}
