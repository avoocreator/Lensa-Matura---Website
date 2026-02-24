document.addEventListener("DOMContentLoaded", async function () {

//generate warna random
function generateRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}


//bagian grafik sama tabel
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS8_zVjZTTw1Lv1QjihIfMhPVebWAdUiCbTgoDisMyWKfR14ZGuyiF-9w2KfS5a0bgECrpuClfRHMRu/pub?gid=280491231&single=true&output=csv";


async function loadSheetCSV() {
    const res = await fetch(sheetURL);
    const text = await res.text();
    return text.trim().split("\n").map(r => r.split(","));
}

async function fillTable() {
    const rows = await loadSheetCSV();
    const tbody = document.querySelector(".table-box tbody");
    tbody.innerHTML = "";

    rows.slice(1).forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${r[0]}</td>
                <td>${r[1]}</td>
            </tr>`;
    });
}

function getChartDataFromTable() {
    const rows = document.querySelectorAll(".table-box tbody tr");
    let labels = [];
    let values = [];

    rows.forEach(row => {
        labels.push(row.children[0].innerText.trim());
        values.push(parseInt(row.children[1].innerText.trim()));
    });

    return { labels, values };
}

Chart.register(ChartDataLabels);
const ctx = document.getElementById("myChart");
let myChart;

function loadChart() {
    const data = getChartDataFromTable();
    if (myChart) myChart.destroy();
    const randomColors = [];
    if (data && data.values) {
        for (let i = 0; i < data.values.length; i++) {
            randomColors.push(generateRandomColor());
        }
    }

    myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Jumlah Peminat",
                data: data.values,
                borderWidth: 1,
                backgroundColor: randomColors, 
                hoverOffset: 20,
                hoverBorderWidth: 3,
                hoverBorderColor: "#fff"
            }]
        },
        options: {
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1200,
                easing: "easeOutCirc",
                delay: (ctx) => ctx.type === "data" ? ctx.dataIndex * 80 : 0
            },

            responsive: true,
            maintainAspectRatio: true, 
            aspectRatio: 1, // Rasio 1:1 (persegi)
            
            plugins: {
                legend: {
                    position: "bottom" // PINDAHKAN KE BAWAH
                },
                datalabels: {
                    color: "#fff",
                    font: { size: 16, weight: "bold", family: "Poppins" },
                    align: "center",
                    anchor: "center"
                }
            }
        }
    });
}


await fillTable();
loadChart();

// ==========================================================
// ======================  KALENDER FIX  =====================
// ==========================================================

const SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIF9SI_Dc-krIbkHibNREagu0ABjzwHpGU_6nspxcm-wW8zV6jUrXhKmRKSa7cRxIZNwuT2-9wIAV1/pub?gid=0&single=true&output=csv";

const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

let currentDate = new Date();
let events = [];

// ===================== PARSE CSV =====================
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    const rows = [];
    let current = [];
    let value = "";
    let inQuotes = false;

    for (let line of lines) {
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    value += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === "," && !inQuotes) {
                current.push(value);
                value = "";
            } else {
                value += char;
            }
        }
        current.push(value);
        rows.push(current);
        current = [];
        value = "";
    }
    return rows;
}

function normalizeDate(str) {
    if (!str) return null;
    str = str.trim();

    // Format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // Format DD/MM/YYYY atau DD-MM-YYYY
    let m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
        let d = m[1].padStart(2, "0");
        let mo = m[2].padStart(2, "0");
        // Mengubah ke format YYYY-MM-DD
        return `${m[3]}-${mo}-${d}`; 
    }

    // Coba parsing dengan Date object
    const dt = new Date(str);
    if (!isNaN(dt)) {
        let y = dt.getFullYear();
        let mo = String(dt.getMonth() + 1).padStart(2, "0");
        let d = String(dt.getDate()).padStart(2, "0");
        return `${y}-${mo}-${d}`;
    }

    return null;
}

async function loadEvents() {
    const res = await fetch(SPREADSHEET_URL);
    const txt = await res.text();
    const rows = parseCSV(txt);

    events = rows.slice(1).map(r => ({
        date: normalizeDate(r[0]),
        title: r[1] || "",
        color: r[2] || ""
    })).filter(e => e.date && e.title);
}

// ====================== LOAD CALENDAR =====================
function loadCalendar() {

    // 1. Clear dulu
    calendarDays.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "Januari","Februari","Maret","April","Mei","Juni",
        "Juli","Agustus","September","Oktober","November","Desember"
    ];

    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Menghitung hari pertama dalam bulan (0=Minggu, 1=Senin, dst.)
    const firstDay = new Date(year, month, 1).getDay(); 
    // Menghitung total hari dalam bulan
    const totalDays = new Date(year, month + 1, 0).getDate(); 

    // 2. Render semua elemen dulu TANPA animasi
    let cells = [];

    // Tambahkan sel kosong untuk mengisi hari sebelum tanggal 1
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("day-cell");
        cells.push(empty);
    }

    // Tambahkan sel untuk setiap tanggal
    for (let d = 1; d <= totalDays; d++) {
        const cell = document.createElement("div");
        cell.classList.add("day-cell");
        cell.textContent = d;

        const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const ev = events.find(e => e.date === iso);

        if (ev) {
            cell.classList.add("event-day");
            let c = ev.color.startsWith("#") ? ev.color : "#" + ev.color;
            
            // ⭐ PERBAIKAN: Menggunakan setProperty dengan 'important' ⭐
            // Ini akan menimpa styling default .event-day di CSS Anda.
            cell.style.setProperty('background-color', c, 'important'); 
            cell.style.setProperty('color', '#ffffff', 'important'); 
            // -------------------------------------------------------------
            
            cell.addEventListener("mousemove", (e) => {
                const tooltip = document.getElementById("eventTooltip");
                tooltip.textContent = ev.title;
                tooltip.style.left = (e.clientX + 12) + "px";
                tooltip.style.top = (e.clientY + 12) + "px";
                tooltip.style.opacity = "1";
            });

            cell.addEventListener("mouseleave", () => {
                const tooltip = document.getElementById("eventTooltip");
                tooltip.style.opacity = "0";
            });
        }

        const today = new Date();
        if (
            d === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            cell.classList.add("today");
        }

        cells.push(cell);
    }

    // Masukkan dulu semuanya ke DOM
    cells.forEach(c => calendarDays.appendChild(c));

    // 3. Baru jalankan ANIMASI (1 frame setelah render)
    requestAnimationFrame(() => {
        cells.forEach((c, i) => {
            c.style.opacity = 0;
            c.style.transform = "translateY(8px)";

            setTimeout(() => {
                c.style.transition = "0.35s ease";
                c.style.opacity = 1;
                c.style.transform = "translateY(0)";
            }, i * 15); // efek stagger
        });
    });
}

// ======= BUTTON =======
prevMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    loadCalendar();
});

nextMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    loadCalendar();
});

// WAJIB: load event dulu
await loadEvents();
loadCalendar();

const logoutLink = document.getElementById('logoutLink');
// Asumsikan halaman login adalah 'index.html' atau 'Login.html' sesuai yang Anda inginkan
const LOGIN_PAGE_URL = "Login.html"; 

function handleSecureLogout(e) {
    e.preventDefault(); // Mencegah navigasi default <a>
    
    // Opsional: Hapus token/session dari Local Storage jika ada
    // localStorage.removeItem('user_token'); 

    // KUNCI UTAMA: Menggantikan halaman saat ini di riwayat browser.
    // Ini mencegah tombol 'Back' browser bekerja.
    window.location.replace(LOGIN_PAGE_URL);
}

// Hubungkan fungsi ke tautan
if (logoutLink) {
    logoutLink.addEventListener("click", handleSecureLogout);
}

});