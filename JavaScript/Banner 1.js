// ==========================================================
// KONFIGURASI DATA SPREADSHEET
// ==========================================================

// URL Rundown Kegiatan
const RUNDOWN_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6wT6xGSgaGcWRT-bQxu5P_0SfDq9RppWKqMByMfJ8CHFugHJ4vnhyuYk_A6wio0GXYv5b4kRHLf0Z/pub?gid=26464494&single=true&output=csv"; 

// URL Mekanisme Event
const MEKANISME_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6wT6xGSgaGcWRT-bQxu5P_0SfDq9RppWKqMByMfJ8CHFugHJ4vnhyuYk_A6wio0GXYv5b4kRHLf0Z/pub?gid=1081057457&single=true&output=csv";


// ==========================================================
// Konversi CSV menjadi Array Objek
// ==========================================================
function parseCSV(csvText) {
    const rows = csvText.trim().split('\n').filter(row => row.trim() !== ''); 
    if (rows.length === 0) return [];
    
    const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        if (values.length !== headers.length) continue; 
        
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : ''; 
        });
        data.push(obj);
    }
    return data;
}


// ==========================================================
// 1. RENDER RUNDOWN TABEL DARI SHEET
// ==========================================================
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


// ==========================================================
// 2. RENDER KARTU MEKANISME DARI SHEET
// ==========================================================
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
        
        MEKANISME_DATA.forEach(item => {
            allCardsHTML += `
                <div class="mekanisme-card" data-detail="${item.detail || ''}">
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
            setupMekanismePopup(); 
        } else {
             container.innerHTML = '<p style="text-align:center;">Data Mekanisme tidak ditemukan.</p>';
        }

    } catch (error) {
        console.error("Gagal memuat data Mekanisme dari Spreadsheet:", error);
        container.innerHTML = '<p style="color:red; text-align:center;">Gagal memuat data. Periksa URL Spreadsheet.</p>';
    }
}


// ==========================================================
// INISIALISASI & EKSEKUSI
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Jalankan render data saat halaman dimuat
    renderRundownTable();
    renderMekanismeCards(); 
});

// ==========================================================
// COUNTDOWN
// ==========================================================
const eventDate = new Date("2025-12-15 08:00:00").getTime();

// Konstanta Durasi dalam Milidetik
const EVENT_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 hari untuk status 'Sedang Berlangsung'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;  // 30 hari untuk status 'Coming Soon'

function updateCountdown() {
    const now = new Date().getTime();
    const diff = eventDate - now; // Selisih waktu: eventDate - now
    const countdownEl = document.getElementById("countdown");
    
    if (!countdownEl) return;

    // --- 1. EVENT SUDAH SELESAI (Lewat > 5 hari) ---
    const eventEndDate = eventDate + EVENT_DURATION_MS;
    if (now > eventEndDate) {
        countdownEl.innerHTML = "<h4 style='margin:0; color:white;'>Event Sudah Selesai</h4>";
        // Anda bisa tambahkan clearInterval(countdownInterval) di sini
        return; 
    }
    
    // --- 2. EVENT SEDANG BERLANGSUNG (Sudah dimulai, tapi belum lewat 5 hari) ---
    if (diff <= 0) {
        countdownEl.innerHTML = "<h4 style='margin:0; color:white;'>Acara Sedang Berlangsung!</h4>";
        return; 
    }
    
    // --- 3. COMING SOON (Sisa waktu > 30 hari) ---
    if (diff > THIRTY_DAYS_MS) {
        countdownEl.innerHTML = "<h4 style='margin:0; color:white;'>Coming Soon</h4>";
        return; 
    }

    // --- 4. COUNTDOWN NORMAL (Sisa waktu <= 30 hari dan event belum dimulai) ---
    
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


// ==========================================================
// BAGIKAN (SHARE) BUTTON
// ==========================================================
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


// ==========================================================
// ANIMASI SCROLL REVEAL
// ==========================================================
function revealElements() {
    let reveals = document.querySelectorAll(".reveal");

    for (let i = 0; i < reveals.length; i++) {
        let windowHeight = window.innerHeight;
        let elementTop = reveals[i].getBoundingClientRect().top;
        let revealPoint = 100; // Titik trigger animasi

        // Elemen masuk reveal area
        if (elementTop < windowHeight - revealPoint) {
            reveals[i].classList.add("active");
        } 
        else {
            reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", revealElements);
revealElements();


// ==========================================================
// POPUP MEKANISME
// ==========================================================

// Fungsi ini harus dipanggil setelah kartu Mekanisme dibuat oleh renderMekanismeCards()
function setupMekanismePopup() {
    // Cari semua kartu mekanisme yang baru dibuat
    const mekanismeCards = document.querySelectorAll(".mekanisme-card");
    const mekanismePopup = document.getElementById("mekanismePopup");
    const popupText = document.getElementById("popupText");

    if (mekanismeCards.length > 0) {
        mekanismeCards.forEach(card => {
            card.addEventListener("click", () => {
                popupText.textContent = card.dataset.detail;
                mekanismePopup.style.display = "flex";
            });
        });
    }
}

// Menutup Pop-up
const closeDetailPopup = document.querySelector(".close-popup");
const mekanismePopup = document.getElementById("mekanismePopup");

if (closeDetailPopup) {
    closeDetailPopup.addEventListener("click", () => {
        mekanismePopup.style.display = "none";
    });
}

// Tutup pop-up jika mengklik di luar box
window.addEventListener("click", function (e) {
    if (e.target === mekanismePopup) {
        mekanismePopup.style.display = "none";
    }
});

// ANIMASI SCROLL REVEAL
function revealElements() {
    let reveals = document.querySelectorAll(".reveal");

    for (let i = 0; i < reveals.length; i++) {
        let windowHeight = window.innerHeight;
        let elementTop = reveals[i].getBoundingClientRect().top;
        let revealPoint = 100;

        if (elementTop < windowHeight - revealPoint) {
            reveals[i].classList.add("active");
        } 
        else {
            // Biarkan elemen tersembunyi lagi saat di-scroll ke atas untuk efek dinamis yang berulang
            reveals[i].classList.remove("active");
        }
    }
}
window.addEventListener("scroll", revealElements);
revealElements();

// ==========================================================
// FITUR INTERAKTIF BARU: LIGHTBOX / MODAL GALLERY LOGIC
// ==========================================================
const imageCards = document.querySelectorAll(".photo-card");
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const captionText = document.getElementById("caption");
const closeBtn = document.querySelector(".close-modal");

if (imageCards.length > 0) {
    imageCards.forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.querySelector('img').src;
            const imgAlt = card.querySelector('.photo-caption').textContent;
            
            modal.style.display = "block";
            modalImg.src = imgSrc;
            captionText.innerHTML = imgAlt;
        });
    });
}

// Tutup modal ketika tombol X diklik
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });
}

// Tutup modal ketika diklik di luar gambar
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});