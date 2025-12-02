/* ============================================================
   EXPORT.JS — CSV and Excel Export System
============================================================ */


/* ------------------------------------------------------------
   RENDER EXPORT TAB UI
------------------------------------------------------------ */
function renderExportTab() {
    const tab = document.getElementById("exportTab");

    tab.innerHTML = `
        <h2 style="color:#2ee7e7;">Export Data</h2>

        <div style="margin-top:20px;">
            <strong>Export Selected Athlete</strong><br>
            <button class="primaryBtn" style="margin:6px;" onclick="exportEntriesCSV()">Export ALL Entries (CSV)</button>
            <button class="primaryBtn" style="margin:6px;" onclick="exportPBsCSV()">Export PB Only (CSV)</button>
            <br>
            <button class="primaryBtn" style="margin:6px;" onclick="exportEntriesExcel()">Export ALL Entries (Excel)</button>
            <button class="primaryBtn" style="margin:6px;" onclick="exportPBsExcel()">Export PB Only (Excel)</button>
        </div>

        <hr style="margin:25px 0; border:1px solid #2ee7e7;">

        <div style="margin-top:15px;">
            <strong>Export ALL Athletes</strong><br>
            <button class="secondaryBtn" style="margin-top:8px;" onclick="exportAllAthletesCSV()">Export All Athletes (CSV)</button>
            <br>
            <button class="secondaryBtn" style="margin-top:8px;" onclick="exportAllAthletesExcel()">Export All Athletes (Excel)</button>
        </div>
    `;
}


/* ------------------------------------------------------------
   CONVERT TO CSV FORMAT
------------------------------------------------------------ */
function convertToCSV(rows) {
    if (rows.length === 0) return "";

    const headers = Object.keys(rows[0]).join(",");
    const data = rows
        .map(r => Object.values(r)
        .map(v => `"${v}"`).join(","))
        .join("\n");

    return headers + "\n" + data;
}


/* ------------------------------------------------------------
   DOWNLOAD A FILE
------------------------------------------------------------ */
function downloadFile(filename, content, type = "text/csv") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}


/* ------------------------------------------------------------
   1. EXPORT ALL ENTRIES (CSV)
------------------------------------------------------------ */
function exportEntriesCSV() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    const rows = [];

    athlete.entries.forEach(entry => {
        Object.keys(entry.times).forEach(dist => {
            rows.push({
                Athlete: athlete.name,
                Age: athlete.age,
                Distance: dist,
                Time: entry.times[dist],
                Location: entry.location,
                Date: formatDate(entry.date)
            });
        });
    });

    const csv = convertToCSV(rows);
    downloadFile(`${athlete.name}_entries.csv`, csv);

    showToast("CSV exported");
}


/* ------------------------------------------------------------
   2. EXPORT PB ONLY (CSV)
------------------------------------------------------------ */
function exportPBsCSV() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    const rows = [];

    Object.keys(athlete.pb).forEach(dist => {
        const pb = athlete.pb[dist];
        rows.push({
            Athlete: athlete.name,
            Age: athlete.age,
            Distance: dist,
            PB_Time: pb.time,
            Location: pb.location,
            Date: formatDate(pb.date)
        });
    });

    const csv = convertToCSV(rows);
    downloadFile(`${athlete.name}_PBs.csv`, csv);

    showToast("PB CSV exported");
}


/* ============================================================
   EXCEL EXPORT (using simple XML since no library needed)
============================================================ */

function buildExcelXML(rows) {
    let xml = `
    <table>
        <tr>${Object.keys(rows[0]).map(h => `<th>${h}</th>`).join("")}</tr>
    `;

    rows.forEach(r => {
        xml += `<tr>${Object.values(r).map(v => `<td>${v}</td>`).join("")}</tr>`;
    });

    xml += "</table>";
    return xml;
}

function exportExcel(filename, rows) {
    if (rows.length === 0) {
        showToast("No data to export.");
        return;
    }

    const xml = buildExcelXML(rows);
    const content = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head><!--[if gte mso 9]><xml>
          <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
          <x:Name>Sheet1</x:Name>
          <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
        </xml><![endif]--></head>
        <body>${xml}</body></html>`;

    downloadFile(filename, content, "application/vnd.ms-excel");

    showToast("Excel exported");
}


/* ------------------------------------------------------------
   3. EXPORT ALL ENTRIES (EXCEL)
------------------------------------------------------------ */
function exportEntriesExcel() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    const rows = [];

    athlete.entries.forEach(entry => {
        Object.keys(entry.times).forEach(dist => {
            rows.push({
                Athlete: athlete.name,
                Age: athlete.age,
                Distance: dist,
                Time: entry.times[dist],
                Location: entry.location,
                Date: formatDate(entry.date)
            });
        });
    });

    exportExcel(`${athlete.name}_entries.xls`, rows);
}


/* ------------------------------------------------------------
   4. EXPORT PB ONLY (EXCEL)
------------------------------------------------------------ */
function exportPBsExcel() {
    const athlete = getAthlete(currentAthleteID);
    if (!athlete) return;

    const rows = [];

    Object.keys(athlete.pb).forEach(dist => {
        rows.push({
            Athlete: athlete.name,
            Age: athlete.age,
            Distance: dist,
            PB_Time: athlete.pb[dist].time,
            Location: athlete.pb[dist].location,
            Date: formatDate(athlete.pb[dist].date)
        });
    });

    exportExcel(`${athlete.name}_PBs.xls`, rows);
}


/* ------------------------------------------------------------
   5. EXPORT ALL ATHLETES (CSV)
------------------------------------------------------------ */
function exportAllAthletesCSV() {
    if (athletes.length === 0) {
        showToast("No athlete data found.");
        return;
    }

    let rows = [];

    athletes.forEach(a => {
        a.entries.forEach(e => {
            Object.keys(e.times).forEach(dist => {
                rows.push({
                    Athlete: a.name,
                    Age: a.age,
                    Distance: dist,
                    Time: e.times[dist],
                    Location: e.location,
                    Date: formatDate(e.date)
                });
            });
        });
    });

    const csv = convertToCSV(rows);
    downloadFile(`All_Athletes_Entries.csv`, csv);
}


/* ------------------------------------------------------------
   6. EXPORT ALL ATHLETES (EXCEL)
------------------------------------------------------------ */
function exportAllAthletesExcel() {
    if (athletes.length === 0) {
        showToast("No athlete data.");
        return;
    }

    let rows = [];

    athletes.forEach(a => {
        a.entries.forEach(e => {
            Object.keys(e.times).forEach(dist => {
                rows.push({
                    Athlete: a.name,
                    Age: a.age,
                    Distance: dist,
                    Time: e.times[dist],
                    Location: e.location,
                    Date: formatDate(e.date)
                });
            });
        });
    });

    exportExcel(`All_Athletes_Entries.xls`, rows);
}

