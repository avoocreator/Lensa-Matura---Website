// ==========================================================
// NAVIGASI TOGGLE (HAMBURGER)
// ==========================================================
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

// Pastikan elemen ditemukan sebelum menambahkan event listener
if (navToggle && navMenu) { 
    navToggle.addEventListener("click", () => {
        
        // Ambil status saat ini dari atribut aria-expanded
        const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
        
        if (isExpanded) {
            // TUTUP MENU
            // Perbarui atribut untuk CSS dan aksesibilitas
            navMenu.setAttribute("data-visible", "false"); 
            navToggle.setAttribute("aria-expanded", "false"); 
        } else {
            // BUKA MENU
            // Perbarui atribut untuk CSS dan aksesibilitas
            navMenu.setAttribute("data-visible", "true"); 
            navToggle.setAttribute("aria-expanded", "true"); 
        }
    });
}