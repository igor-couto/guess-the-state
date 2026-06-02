let slideIndex = 0;

function showSlides() {
    const slides = document.querySelectorAll('.card');
    const carousel = document.querySelector('.carousel');

    const cardWidth = slides[0].offsetWidth; // Width of a single card
    const margin = 20; // Margin between cards
    const totalCardWidth = cardWidth + margin; // Total width of a card including margin

    // Calculate the total width of the carousel
    const carouselWidth = carousel.offsetWidth;

    // Calculate the offset needed to center the active slide
    const translateX = -(slideIndex * totalCardWidth) + (carouselWidth / 2) - (cardWidth / 2);

    // Apply the transform to center the active slide
    carousel.style.transform = `translateX(${translateX}px)`;

    // Update each card's state
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        slide.style.transform = 'scale(0.8)';
        slide.style.opacity = '0.5';
    });

    // Set the active slide
    slides[slideIndex].classList.add('active');
    slides[slideIndex].style.transform = 'scale(1.1)';
    slides[slideIndex].style.opacity = '1';
}

function prevSlide() {
    const slides = document.querySelectorAll('.card');
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    showSlides();
}

function nextSlide() {
    const slides = document.querySelectorAll('.card');
    slideIndex = (slideIndex + 1) % slides.length;
    showSlides();
}

function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
        prevSlide();
    } else if (event.key === 'ArrowRight') {
        nextSlide();
    }
}

function setupBackgroundVideo() {
    const video = document.getElementById('background-video');
    if (!video) return;

    // Only autoplay the looping video when the user hasn't asked for reduced
    // motion; otherwise leave it paused on its poster (and never fetch it).
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
        if (reduceMotion.matches) {
            video.pause();
        } else {
            video.play().catch(() => {});
        }
    };

    sync();
    reduceMotion.addEventListener('change', sync);
}

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.card');
    const firstEnabled = Array.from(slides).findIndex(card => !card.classList.contains('disabled'));
    slideIndex = firstEnabled === -1 ? 0 : firstEnabled;

    showSlides();
    setupBackgroundVideo();
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', showSlides);
});
