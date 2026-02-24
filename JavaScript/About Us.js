document.addEventListener("DOMContentLoaded", function () {
    
    // Animasi masuk
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    // Fungsi callback ketika elemen terlihat
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Tambahkan class 'show' untuk memicu CSS transition
                entry.target.classList.add('show');
                // Hentikan observasi setelah elemen muncul (agar tidak berulang-ulang)
                observer.unobserve(entry.target);
            }
        });
    };

    // Membuat Observer baru
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Pilih semua elemen yang memiliki class 'hidden'
    const hiddenElements = document.querySelectorAll('.hidden');
    
    // Mulai observasi setiap elemen
    hiddenElements.forEach((el) => observer.observe(el));
});
