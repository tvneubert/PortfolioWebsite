document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const pixelContainer = document.getElementById('pixel-container');
    const numberOfPixels = 100; // Anzahl der Pixel, die erzeugt werden sollen

    const pixels = [];

    // Zufällige Farbe generieren
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Pixel erstellen
    for (let i = 0; i < numberOfPixels; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');

        // Zufällige Startposition und Farbe
        pixel.style.left = Math.random() * 100 + 'vw';
        pixel.style.top = Math.random() * 100 + 'vh';
        pixel.style.backgroundColor = getRandomColor();

        pixelContainer.appendChild(pixel);
        pixels.push(pixel);
    }

    // Scroll-Event hinzufügen
    window.addEventListener('scroll', () => {
        pixels.forEach(pixel => {
            const speed = Math.random() * 0.4; // Zufällige Geschwindigkeit
            const movement = (window.scrollY * speed) % window.innerHeight; // Bewegung basierend auf Scrollposition
            pixel.style.transform = `translateY(${movement}px)`;
        });
    });
});