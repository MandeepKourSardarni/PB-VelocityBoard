/* ============================================================
   THEME.JS — Light / Dark Mode System for PB VelocityBoard 5.0
============================================================ */

let currentTheme = "dark"; // default


/* ------------------------------------------------------------
   LOAD THEME FROM STORAGE
------------------------------------------------------------ */
function loadTheme() {
    const saved = localStorage.getItem("PB_VB_THEME");
    if (saved) currentTheme = saved;

    applyTheme();
}


/* ------------------------------------------------------------
   APPLY THEME (change CSS classes)
------------------------------------------------------------ */
function applyTheme() {
    if (currentTheme === "light") {
        document.body.classList.add("light");
    } else {
        document.body.classList.remove("light");
    }
}


/* ------------------------------------------------------------
   TOGGLE THEME
------------------------------------------------------------ */
function toggleTheme() {
    currentTheme = (currentTheme === "dark") ? "light" : "dark";

    applyTheme();
    saveTheme();

    showToast(`Switched to ${currentTheme} mode`);
}


/* ------------------------------------------------------------
   SAVE THEME
------------------------------------------------------------ */
function saveTheme() {
    localStorage.setItem("PB_VB_THEME", currentTheme);
}


/* ------------------------------------------------------------
   RENDER THEME SETTING UI (inside Settings tab)
------------------------------------------------------------ */
function renderSettingsTab() {
    const settingsTab = document.getElementById("settingsTab");

    settingsTab.innerHTML = `
        <h2 style="color:#2ee7e7;">Settings</h2>
        
        <div style="margin-top:20px;">
            <strong>Theme</strong><br>
            <button onclick="toggleTheme()" class="primaryBtn" style="margin-top:8px;">
                Switch to ${currentTheme === "dark" ? "Light" : "Dark"} Mode
            </button>
        </div>

        <div style="margin-top:35px;">
            <strong>Current Athlete</strong><br>
            <button onclick="switchAthleteScreen()" class="secondaryBtn" style="margin-top:8px;">
                Change Athlete
            </button>
        </div>
    `;
}


/* ------------------------------------------------------------
   GO BACK TO ATHLETE SELECTION SCREEN
------------------------------------------------------------ */
function switchAthleteScreen() {
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("athleteSelectScreen").style.display = "block";
}


/* ------------------------------------------------------------
   INITIALIZE WHEN PAGE LOADS
------------------------------------------------------------ */
window.addEventListener("load", () => {
    loadTheme();
    setupTabNavigation();
});


/* ------------------------------------------------------------
   TAB NAVIGATION LOGIC
------------------------------------------------------------ */
function setupTabNavigation() {
    const tabs = document.querySelectorAll(".tab");
    const pages = document.querySelectorAll(".tabPage");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove("activeTab"));
            tab.classList.add("activeTab");

            const target = tab.getAttribute("data-tab");

            pages.forEach(page => {
                if (page.id === target) {
                    page.classList.add("activePage");

                    if (target === "settingsTab") {
                        renderSettingsTab();
                    }

                    if (target === "trendsTab") {
                        renderTrendsTab();
                    }

                    if (target === "exportTab") {
                        renderExportTab();
                    }

                } else {
                    page.classList.remove("activePage");
                }
            });
        });
    });
}
