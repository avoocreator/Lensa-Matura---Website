// --- KONFIGURASI ---
// URL Google Sheet CSV
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHx5NQFBWLjCqEBs0gOgBzBsj5GbEBbj3p4YLcNmkrDk7IbJ0dcKwDdE0PZdJrvxeNDzpbYth4BEEV/pub?output=csv'; 

// Elemen Login
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.getElementById('btn-loader'); // Loader kecil di tombol
const messageBox = document.getElementById('message');
const card = document.querySelector('.login-card');

// Elemen Animasi Loading Screen
const fullLoader = document.getElementById('full-page-loader');
const portalScene = document.getElementById('portalScene'); // Scene Baru
const portalLogo = document.getElementById('portalLogo'); 

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const inputNIS = document.getElementById('nis').value.trim();
    const inputSandi = document.getElementById('sandi').value.trim();

    // 1. Tampilkan Loading di Tombol
    setLoading(true);
    messageBox.textContent = "";
    messageBox.className = "message-box";

    try {
        // 2. Fetch Data
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error("Gagal koneksi ke server data.");
        
        const dataText = await response.text();
        
        // 3. Validasi User
        const isValid = validateUser(dataText, inputNIS, inputSandi);

        if (isValid) {
            // === LOGIN BERHASIL ===
            messageBox.textContent = "Login Diterima!";
            messageBox.classList.add('success');
            
            // Hilangkan kartu login perlahan
            card.style.opacity = "0"; 
            card.style.transform = "translateY(-20px)";

            // Aktifkan Full Screen Animation
            fullLoader.classList.remove('hidden');
            
            // Delay sedikit untuk trigger Logo muncul
            setTimeout(() => {
                portalScene.classList.add('portal-active'); // Logo berputar perlahan
            }, 100);

            // LOGIKA ANIMASI BARU (The Portal Shift)
            
            // 1. Tunggu sebentar (2 detik) setelah logo muncul
            setTimeout(() => {
                
                // 2. Mulai animasi Portal Shift (Spread out)
                portalScene.classList.add('portal-shift');
                
                // 3. Tunggu Portal Spread (~0.6s)
                setTimeout(() => {
                    
                    // 4. Mulai transisi Fade ke Warna Pintu (Primary)
                    fullLoader.classList.add('fade-to-primary');
                    
                    // 5. Tunggu transisi primary selesai (~0.5s)
                    setTimeout(() => {
                        
                        // 6. Mulai transisi Fade ke Warna Putih
                        fullLoader.classList.add('fade-to-white');

                        // 7. Pindah halaman setelah transisi putih selesai (~0.7s)
                        setTimeout(() => {
                            window.location.href = "Beranda.html"; 
                        }, 700); 

                    }, 500); 
                    
                }, 600); // Durasi transisi portalSpread di CSS (~0.6s)

            }, 2000); // Total waktu logo berputar sebelum shift

        } else {
            // === LOGIN GAGAL ===
            throw new Error("NIS atau Kata Sandi salah.");
        }

    } catch (error) {
        // Error Handling
        messageBox.textContent = error.message;
        messageBox.classList.add('error');
        
        // Efek getar
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
        
        setLoading(false);
    }
});

// Fungsi cek data di CSV
function validateUser(csvText, nis, password) {
    const rows = csvText.split('\n'); 
    
    // Loop mulai index 1 (lewati header)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(','); 
        
        if (row.length >= 2) {
            const dbNIS = row[0].replace(/["\r]/g, "").trim(); 
            const dbPass = row[1].replace(/["\r]/g, "").trim();

            // Cek kecocokan
            if (dbNIS === nis && dbPass === password) {
                return true;
            }
        }
    }
    return false;
}

// Fungsi atur tampilan tombol saat loading
function setLoading(isLoading) {
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        loginBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        loginBtn.disabled = false;
    }

}
