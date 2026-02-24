// URL Rundown Kegiatan (dari Tab "Rundown Kegiatan" yang sudah di-Publish)
const RUNDOWN_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6wT6xGSgaGcWRT-bQxu5P_0SfDq9RppWKqMByMfJ8CHFugHJ4vnhyuYk_A6wio0GXYv5b4kRHLf0Z/pub?gid=581131015&single=true&output=csv";

// URL Mekanisme Event (dari Tab "Mekanisme Event" yang sudah di-Publish)
const MEKANISME_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6wT6xGSgaGcWRT-bQxu5P_0SfDq9RppWKqMByMfJ8CHFugHJ4vnhyuYk_A6wio0GXYv5b4kRHLf0Z/pub?gid=1863264548&single=true&output=csv";


// FUNGSI UTILITY: Mengubah CSV menjadi Array Objek (Diperbaiki)
function parseCSV(csvText) {
    const rows = csvText.trim().split('\n').filter(row => row.trim() !== '');
    if (rows.length === 0) return [];

    // Mengambil header (baris pertama) dan membersihkan spasi/kapitalisasi
    // Menggunakan regex untuk pemisahan, lebih aman dari spasi atau quote
    const headers = rows[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                            .map(header => header.trim().replace(/"/g, '').toLowerCase());
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        // Pemisahan baris data dengan regex yang sama
        const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        // Jika jumlah nilai tidak cocok, lewati (kecuali ini adalah baris kosong)
        if (values.length !== headers.length) {
            if (rows[i].trim() !== '') {
                console.warn(`Baris ${i + 1} di CSV diabaikan karena jumlah kolom tidak cocok.`);
            }
            continue;
        }

        const obj = {};
        headers.forEach((header, index) => {
            // Menghapus quote dan trim
            obj[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });
        data.push(obj);
    }
    return data;
}

//RENDER RUNDOWN TABEL DARI SHEET
async function renderRundownTable() {
    const tableBody = document.getElementById('rundownTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Memuat data Rundown...</td></tr>';

    try {
        const response = await fetch(RUNDOWN_CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const csvText = await response.text();
        const RUNDOWN_DATA = parseCSV(csvText);

        tableBody.innerHTML = '';

        RUNDOWN_DATA.forEach(item => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${item.kegiatan || ''}</td>
                <td>${item.waktu || ''}</td>
                <td>${item.tempat || ''}</td>
                <td>${item.keterangan || ''}</td>
            `;
        });

        if (RUNDOWN_DATA.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Data Rundown tidak ditemukan.</td></tr>';
        }

    } catch (error) {
        console.error("Gagal memuat data Rundown dari Spreadsheet:", error);
        tableBody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Gagal memuat data. Periksa URL Spreadsheet.</td></tr>';
    }
}
//RENDER KARTU MEKANISME DARI SHEET (Ditambahkan: setupMekanismePopup dipanggil di sini)
async function renderMekanismeCards() {
    const container = document.getElementById('mekanismeContainer');
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;">Memuat kartu mekanisme...</p>';

    try {
        const response = await fetch(MEKANISME_CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const csvText = await response.text();
        const MEKANISME_DATA = parseCSV(csvText);

        container.innerHTML = '';
        let allCardsHTML = '';

        // DEBUG: console.log(MEKANISME_DATA); // Cek di console browser untuk memastikan 4 baris terbaca

        MEKANISME_DATA.forEach(item => {
            // Pastikan item.icon, item.judul, item.teks, item.detail sudah lowercase karena diolah di parseCSV
            allCardsHTML += `
                <div class="mekanisme-card reveal" data-detail="${item.detail || ''}">
                    <div class="card-icon"><i class="fa-solid ${item.icon || ''}"></i></div>
                    <h3 class="judul">${item.judul ? item.judul.toUpperCase() : ''}</h3>
                    <p class="mekanisme-text">${item.teks || ''}</p>
                    <div class="link-wrapper">
                        <span class="click-info">Lihat Detail <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = allCardsHTML;

        if (MEKANISME_DATA.length > 0) {
            // Panggil setupMekanismePopup setelah kartu dibuat
            setupMekanismePopup();
            // Panggil revealElements lagi untuk menerapkan animasi ke kartu yang baru dimuat
            revealElements();
        } else {
             container.innerHTML = '<p style="text-align:center;">Data Mekanisme tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Gagal memuat data Mekanisme dari Spreadsheet:", error);
        container.innerHTML = '<p style="color:red; text-align:center;">Gagal memuat data. Periksa URL Spreadsheet.</p>';
    }
}


// INISIALISASI & EKSEKUSI


document.addEventListener('DOMContentLoaded', () => {
    // Jalankan render data saat halaman dimuat
    renderRundownTable();
    renderMekanismeCards();
    // Jalankan countdown
    updateCountdown();
});


// COUNTDOWN LOGIC

const eventDate = new Date("2026-03-01 08:00:00").getTime();

// Konstanta Durasi dalam Milidetik
const EVENT_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 hari untuk status 'Sedang Berlangsung'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;  // 30 hari untuk status 'Coming Soon'

function updateCountdown() {
    const now = new Date().getTime();
    const diff = eventDate - now; // Selisih waktu: eventDate - now
    const countdownEl = document.getElementById("countdown");
    
    // Pastikan elemen countdown ada untuk menghindari error
    if (!countdownEl) return;

    // --- 1. LOGIKA EVENT SUDAH SELESAI (Lewat > 5 hari) ---
    const eventEndDate = eventDate + EVENT_DURATION_MS;
    if (now > eventEndDate) {
        countdownEl.innerHTML = "<h4 style='margin:0; color:white;'>Event Sudah Selesai</h4>";
        // Anda bisa tambahkan clearInterval(countdownInterval) di sini
        return; 
    }
    
    // --- 2. LOGIKA ACARA SEDANG BERLANGSUNG (Sudah dimulai, tapi belum lewat 5 hari) ---
    if (diff <= 0) {
        countdownEl.innerHTML = "<h4 style='margin:0; color:white;'>Acara Sedang Berlangsung!</h4>";
        return; 
    }
    
    // --- 3. LOGIKA COMING SOON (Sisa waktu > 30 hari) ---
    if (diff > THIRTY_DAYS_MS) {
        countdownEl.innerHTML = "<h4 style='margin:0; color:white;'>Coming Soon</h4>";
        return; 
    }

    // --- 4. LOGIKA COUNTDOWN NORMAL (Sisa waktu <= 30 hari dan event belum dimulai) ---
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Mengisi angka ke dalam elemen (Hanya berjalan jika status bukan di atas)
    if (document.getElementById("days")) document.getElementById("days").innerText = days;
    if (document.getElementById("hours")) document.getElementById("hours").innerText = hours;
    if (document.getElementById("minutes")) document.getElementById("minutes").innerText = minutes;
    if (document.getElementById("seconds")) document.getElementById("seconds").innerText = seconds;
}

// Inisialisasi interval
const countdownInterval = setInterval(updateCountdown, 1000);

// FITUR BAGIKAN (SHARE)

const shareBtn = document.getElementById('shareBtn');

if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const pageUrl = window.location.href;
        navigator.clipboard.writeText(pageUrl).then(() => {
            alert("Link berhasil disalin!");
        }).catch(err => {
            alert("Gagal menyalin link.");
        });
    });
}


// ANIMASI SCROLL REVEAL

function revealElements() {
    let reveals = document.querySelectorAll(".reveal");

    for (let i = 0; i < reveals.length; i++) {
        let windowHeight = window.innerHeight;
        let elementTop = reveals[i].getBoundingClientRect().top;
        let revealPoint = 100; // Titik trigger animasi

        // Jika elemen masuk ke area pandang
        if (elementTop < windowHeight - revealPoint) {
            reveals[i].classList.add("active");
        }
        // TAMBAHAN: Jika elemen keluar dari area pandang (ke bawah layar), hapus 'active' untuk diulang
        else {
            reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", revealElements);
// Panggil sekali saat load (panggilan ini dipastikan hanya setelah DOMContentLoaded)


// POPUP MEKANISME (LOGIC DIPERBARUI UNTUK KARTU DINAMIS)

// Fungsi ini harus dipanggil setelah kartu Mekanisme dibuat
function setupMekanismePopup() {
    // Cari semua kartu mekanisme yang baru dibuat
    const mekanismeCards = document.querySelectorAll(".mekanisme-card");
    const mekanismePopup = document.getElementById("mekanismePopup");
    const popupText = document.getElementById("popupText");

    if (mekanismeCards.length > 0) {
        mekanismeCards.forEach(card => {
            card.addEventListener("click", () => {
                // Ambil data detail dari attribute 'data-detail'
                popupText.textContent = card.dataset.detail;
                mekanismePopup.style.display = "flex";
            });
        });
    }
}

// Logic untuk menutup Pop-up (Elemen ini statis, jadi tidak perlu dipanggil di fungsi render)
const closeDetailPopup = document.querySelector(".close-popup");
const mekanismePopup = document.getElementById("mekanismePopup");

if (closeDetailPopup && mekanismePopup) {
    closeDetailPopup.addEventListener("click", () => {
        mekanismePopup.style.display = "none";
    });

    // Tutup pop-up jika mengklik di luar box
    window.addEventListener("click", function (e) {
        if (e.target === mekanismePopup) {
            mekanismePopup.style.display = "none";
        }
    });
}