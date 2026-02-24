// URL CSV
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQsInBtaEC2CHzjc8mMaPXde9cpy_0CIP10-QucsskA3dHXcGTZqt6A9itBjEVVsvjaAbb64oCt68Ii/pub?output=csv'; 

const juaraListElement = document.getElementById('juara-list');
const DEFAULT_NAME = 'Memuat...';

// Konfigurasi Kolom
const VISIBLE_COLUMNS = ['Juara', 'Kelas']; 
const NAME_COLUMN_FOR_PODIUM = 'Kelas'; 

// --- FUNGSI BARU: Pemicu Confetti ---
function triggerConfetti() {
    // Pastikan confetti tersedia (dari library CDN yang dimuat di HTML)
    if (typeof confetti !== 'function') return; 
    
    // Confetti dari tengah
    confetti({
        particleCount: 100, 
        spread: 70, 
        origin: { y: 0.6 },
        colors: ['#5D3E83', '#A592C4', '#F8F8FF', 'gold']
    });

    // Confetti dari kiri
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60, 
            spread: 55,
            origin: { x: 0, y: 0.6 }, 
            colors: ['#5D3E83', '#A592C4', '#F8F8FF', 'silver']
        });
    }, 100);

    // Confetti dari kanan
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120, 
            spread: 55,
            origin: { x: 1, y: 0.6 }, 
            colors: ['#5D3E83', '#A592C4', '#F8F8FF', '#CD7F32']
        });
    }, 200);
}
// ------------------------------------

// Fungsi untuk mengisi Juara 1, 2, dan 3
function fillPodium(data) {
    
    const nameColumn = NAME_COLUMN_FOR_PODIUM; 
    const juara1 = data[0];
    const juara2 = data[1];
    const juara3 = data[2];

    const podiumItems = [
        { selector: '.podium-item.first', data: juara1 },
        { selector: '.podium-item.second', data: juara2 },
        { selector: '.podium-item.third', data: juara3 }
    ];

    let animationPromises = [];

    podiumItems.forEach(item => {
        const podiumEl = document.querySelector(item.selector);
        
        if (podiumEl) {
            const nameBox = podiumEl.querySelector('.name-box');
            
            // 1. Nama pemenang
            if (item.data && item.data[nameColumn]) {
                nameBox.textContent = item.data[nameColumn];
            } else {
                nameBox.textContent = 'Tidak Ada';
            }
            
            // 2. Tambahkan kelas 'animate' untuk memicu CSS Keyframes podium rise
            animationPromises.push(new Promise(resolve => {
                setTimeout(() => {
                    podiumEl.classList.add('animate');
                    
                    setTimeout(resolve, 2500); 
                }, 100); 
            }));
        }
    });

    // Tunggu hingga SEMUA animasi podium selesai
    Promise.all(animationPromises).then(() => {
        // Panggil confetti setelah semua animasi podium selesai
        // Confetti dipicu setelah semua podium naik dan nama muncul
        triggerConfetti(); 
    });
}


// Fungsi pembantu untuk membuat struktur tabel HTML dari data array
function generateTable(data) {
    if (!data || data.length === 0) {
        return '<p class="no-data">Belum ada pengumuman juara saat ini.</p>';
    }

    const headers = VISIBLE_COLUMNS; 
    let table = '<table class="juara-table">';
    
    // Header Tabel (TH)
    table += '<thead><tr>';
    headers.forEach(header => {
        const displayHeader = header.trim() || 'Kolom';
        table += `<th>${displayHeader}</th>`;
    });
    table += '</tr></thead>';

    // Isi Tabel (TD)
    table += '<tbody>';
    data.forEach((row, index) => {
        // Tambahkan CSS Custom Property (--row-index) untuk Staggered Animation
        table += `<tr style="--row-index: ${index};">`; 
        headers.forEach(header => {
            const cellData = row[header] !== undefined && row[header] !== null ? row[header] : '';
            table += `<td>${cellData}</td>`;
        });
        table += '</tr>';
    });
    table += '</tbody></table>';

    return table;
}

// Fungsi utama untuk mengambil dan memproses data CSV
function fetchJuaraData() {
    juaraListElement.innerHTML = '<p class="loading">Memuat daftar juara selengkapnya...</p>';
    
    // Bersihkan teks default podium segera setelah loading dimulai
    document.querySelectorAll('.podium-item .name-box').forEach(el => {
        el.textContent = ''; 
    });
    
    Papa.parse(CSV_URL, {
        download: true,
        header: true,   
        skipEmptyLines: true, 
        
        complete: function(results) {
            const juaraArray = results.data.filter(row => 
                Object.values(row).some(val => val && val.toString().trim() !== "")
            );
            
            if (juaraArray.length === 0 || results.errors.length > 0) {
                if (results.errors.length > 0) {
                    console.error('Error saat memparsing CSV:', results.errors);
                }
                juaraListElement.innerHTML = '<p class="no-data">Belum ada pengumuman juara saat ini.</p>';
                document.querySelectorAll('.podium-item .name-box').forEach(el => {
                    el.textContent = 'Tidak Ada';
                });
                return;
            }

            // 1. Isi Podium Juara Utama dan Tambahkan kelas 'animate'
            fillPodium(juaraArray);

            // 2. Buat dan Tampilkan Tabel Juara Selengkapnya
            const tableHTML = generateTable(juaraArray);
            juaraListElement.innerHTML = tableHTML;
            
            // 3. Tambahkan kelas 'loaded' untuk memicu animasi Fade-in
            const podiumContainer = document.querySelector('.podium-container');
            const juaraTabel = document.querySelector('.juara-tabel');
            if (podiumContainer) {
                podiumContainer.classList.add('loaded');
            }
            if (juaraTabel) {
                juaraTabel.classList.add('loaded'); 
            }
        },
        
        error: function(error) {
            console.error('Gagal mengambil file CSV:', error);
            juaraListElement.innerHTML = `<p class="error-message">❌ Gagal memuat daftar juara. (${error.message})</p>`;
            
            document.querySelectorAll('.podium-item .name-box').forEach(el => {
                el.textContent = 'Gagal Muat';
            });
        }
    });
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', fetchJuaraData);