document.addEventListener("DOMContentLoaded", function() {

    const slider = document.getElementById("slider");
    const dots = document.querySelectorAll("#dots span");
    const slides = document.querySelectorAll(".slide");

    // Periksa apakah elemen ditemukan
    if (!slider || dots.length === 0 || slides.length === 0) {
        console.error("Banner UI.js: Satu atau lebih elemen (slider, dots, slides) tidak ditemukan.");
        return; // Hentikan eksekusi jika elemen tidak ada
    }

    let index = 0;
    const totalSlides = slides.length;

    function updateSlider() {
      const slideWidth = slides[0].clientWidth + 25; // width + gap

      slider.scrollTo({
        left: index * slideWidth,
        behavior: "smooth"
      });

      // Dots warna ungu
      dots.forEach((dot, i) => {
        if (i === index) {
            dot.style.background = "#6F3A8A"; 
            dot.style.width = "30px"; 
            dot.style.opacity = "1";
        } else {
            dot.style.background = "#cbd5e0";
            dot.style.width = "10px"; 
            dot.style.opacity = "0.5";
        }
      });
    }

    function autoSlide() {
      index = (index + 1) % totalSlides;
      updateSlider();
    }

    // Auto move every 3s
    setInterval(autoSlide, 3000);

    // Dots click navigation
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        index = i;
        updateSlider();
      });
    });

    updateSlider(); 
});