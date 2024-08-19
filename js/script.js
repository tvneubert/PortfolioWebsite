document.addEventListener('DOMContentLoaded', () => {
    // Laden der Komponenten
    loadComponent('header', 'components/header.html', 'css/header.css');
    loadComponent('pixel-background', 'components/pixel-background.html');
    loadComponent('cube', 'components/cube.html', 'css/cube.css');

    function loadComponent(id, file, cssFile) {
        fetch(file)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;

                // CSS-Datei laden, falls angegeben
                if (cssFile) {
                    loadCSS(cssFile);
                }

                if (id === 'pixel-background') {
                    initializePixels();
                }
                if (id === 'cube') {
                    initializeCube();
                }
            });
    }

    // Funktion zum Laden von CSS-Dateien
    function loadCSS(file) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        document.head.appendChild(link);
    }

    // Hintergrund generieren
    function initializePixels() {
        const pixelContainer = document.getElementById('pixel-container');
        const numberOfPixels = 100;

        const pixels = [];

        // Pixel Farbe generieren
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
            pixel.style.left = Math.random() * 100 + 'vw';
            pixel.style.top = Math.random() * 100 + 'vh';
            pixel.style.backgroundColor = getRandomColor();
            pixelContainer.appendChild(pixel);
            pixels.push(pixel);
        }

        // Scroll Event für Pixel-Bewegung
        window.addEventListener('scroll', () => {
            pixels.forEach(pixel => {
                const speed = Math.random() * 0.4;
                const movement = (window.scrollY * speed) % window.innerHeight;
                pixel.style.transform = `translateY(${movement}px)`;
            });
        });
    }

    // Cube generieren
    function initializeCube() {
        const cube = document.querySelector('.cube');  // Korrigiert: '.cube'
        let scrollRotation = 0;

        window.addEventListener('scroll', () => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = window.scrollY / maxScroll;
            scrollRotation = scrollPercent * 360;
            cube.style.transform = `rotateX(${scrollRotation}deg) rotateY(${scrollRotation}deg)`;
        });
    }
});
