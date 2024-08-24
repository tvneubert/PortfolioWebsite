document.addEventListener('DOMContentLoaded', () => {
    // Laden der Komponenten
    loadComponent('header', 'components/header.html', 'css/header.css');
    loadComponent('pixel-background', 'components/pixel-background.html');
    loadComponent('cube', 'components/cube.html', 'css/cube.css');
    loadComponent('footer', 'components/footer.html', 'css/footer.css');

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
                if (id === 'footer') {
                    moveFooter();
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

    // Pixel-Farbe generieren
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Hintergrund generieren
    function initializePixels() {
        const pixelContainer = document.getElementById('pixel-container');
        const numberOfPixels = 100; // Anzahl der Pixel kann hier angepasst werden
        const pixelSize = 10;
        const columns = Math.floor(window.innerWidth / pixelSize);
        const rows = Math.floor(window.innerHeight / pixelSize);


        // Pixel erstellen
        createPixels();

        // Scroll-Event für Pixel-Bewegung
        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            const pixels = Array.from(document.getElementsByClassName('pixel'));
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollDirection = scrollTop > lastScrollTop ? 1 : -1; // 1 für nach unten, -1 für nach oben
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Für Mobile oder negative Werte
            pixels.forEach(pixel => {
                let top = parseFloat(pixel.style.top);
                const speed = parseFloat(pixel.getAttribute('data-speed')); // Verschiedene Geschwindigkeiten
                top += speed * scrollDirection;

                if (top > window.innerHeight) {
                    // Wenn der Pixel unten angekommen ist, nach oben zurücksetzen
                    top = -11; // -10px damit er leicht außerhalb des sichtbaren Bereichs beginnt
                } else if (top < -11) {
                    // Wenn der Pixel oben angekommen ist, nach unten zurücksetzen
                    top = window.innerHeight;
                }
                pixel.style.top = top + 'px';
            });
        });

        // Pixel erstellen
        function createPixels() {
            let createdPixels = 0;
            for (let i = 0; i < columns && createdPixels <= numberOfPixels; i++) {
                for (let j = 0; j < rows && createdPixels <= numberOfPixels; j++) {
                    const pixel = document.createElement('div');
                    pixel.className = 'pixel';
                    pixel.style.position = 'absolute';
                    pixel.style.top = `${Math.random() * window.innerHeight}px`;
                    pixel.style.left = `${Math.random() * window.innerWidth}px`;
                    pixel.style.backgroundColor = getRandomColor();
                    pixel.setAttribute('data-speed', (Math.random() * 100 + 1).toFixed(2)); // Geschwindigkeit zwischen 1 und 3
                    pixelContainer.appendChild(pixel);
                    createdPixels++;
                }

            }
        }
    }

    // Cube generieren
    function initializeCube() {
        const cube = document.querySelector('.cube');
        const container = document.querySelector('.container');
        let scrollRotation = 0;

        window.addEventListener('scroll', () => {
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = window.scrollY / maxScroll;
            scrollRotation = scrollPercent * 360;
            cube.style.transform = `rotateX(${scrollRotation}deg) rotateY(${scrollRotation}deg)`;
            container.style.transform = `translateY(${scrollPercent * 100}vh)`;
        });
    }

    function moveFooter() {
        const footer = document.querySelector('.footer');
        const footerHeight = footer.offsetHeight;
        const windowHeight = window.innerHeight;
        const initialPosition = -footerHeight;
        const visiblePosition = 0;
        const slowFactor = 40; // Faktor, um die Geschwindigkeit des Footers zu reduzieren

        footer.style.bottom = `${initialPosition}px`;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const maxScroll = document.body.scrollHeight - windowHeight;

            // Berechnung des Footer-Positionswerts
            let footerPosition = Math.min(visiblePosition, initialPosition + scrollY / slowFactor);

            // Setzen der Position des Footers
            footer.style.bottom = `${footerPosition}px`;

            // Wenn der Footer sichtbar wird, fülle ihn relativ zum Scroll Event mit Pixeln
            updateFooterPixels(footer, scrollY, maxScroll);

            // Wenn der Footer komplett sichtbar ist, bleibt er fixiert am unteren Rand
            if (scrollY >= maxScroll - footerHeight) {
                footer.style.position = 'fixed';
                footer.style.bottom = `${visiblePosition}px`;
            } else {
                footer.style.position = 'fixed';
            }
        });
    }

    function updateFooterPixels(footer, scrollY) {
        const pixelSize = 10; // Größe der Pixel
        const minDistanceFromTop = 10; // Mindestabstand von der oberen Kante des Footers
        const pixelDensity = Math.floor(scrollY / 25); // Anzahl der Pixel relativ zur Scroll-Position

        // Bestehende Pixel überprüfen und entfernen, wenn die Scroll-Position abnimmt
        const existingPixels = Array.from(footer.getElementsByClassName('footer-pixel'));
        const excessPixels = existingPixels.length - pixelDensity;

        if (excessPixels > 0) {
            // Entferne überschüssige Pixel
            for (let i = 0; i < excessPixels; i++) {
                footer.removeChild(existingPixels[i]);
            }
        } else {
            // Füge neue Pixel hinzu
            const newPixels = Math.abs(excessPixels);
            for (let i = 0; i < newPixels; i++) {
                const pixel = document.createElement('div');
                pixel.classList.add('footer-pixel');
                pixel.style.backgroundColor = getRandomColor();
                pixel.style.width = `${pixelSize}px`;
                pixel.style.height = `${pixelSize}px`;

                // Zufällige horizontale Position im Footer
                const left = Math.floor(Math.random() * Math.floor(footer.offsetWidth / pixelSize)) * pixelSize;
                pixel.style.left = `${left}px`;
                // Setze die `top`-Position, sodass das Pixel mindestens 10px unterhalb der Oberkante des Footers erscheint
                const top = minDistanceFromTop + Math.random() * (footer.offsetHeight - minDistanceFromTop - pixelSize);
                pixel.style.top = `${top}px`;

                footer.appendChild(pixel);
            }
        }

        // Pixel fallen und stapeln sich, sobald sie andere Pixel oder den Boden des Footers erreichen
        existingPixels.forEach(pixel => {
            let top = parseFloat(pixel.style.top);

            // Berechne das nächste potenzielle Pixel, auf das dieses Pixel fallen könnte
            const left = parseFloat(pixel.style.left);
            const otherPixelsBelow = existingPixels.filter(p => parseFloat(p.style.left) === left && parseFloat(p.style.top) > top);

            // Finde das niedrigste Pixel auf der gleichen horizontalen Position
            const lowestPixelBelow = otherPixelsBelow.length > 0 ? Math.min(...otherPixelsBelow.map(p => parseFloat(p.style.top))) : footer.offsetHeight;

            // Pixel fallen, bis sie entweder den Boden oder ein anderes Pixel erreichen
            const fallDistance = Math.min(lowestPixelBelow - pixelSize, footer.offsetHeight - pixelSize);

            if (top + 2 <= fallDistance) {
                // Pixel fällt weiter
                top += 2; // Geschwindigkeit des Falls
            } else {
                // Pixel erreicht den Boden oder ein anderes Pixel und bleibt gestapelt
                top = fallDistance;
            }

            pixel.style.top = `${top}px`;
        });

        lastScrollY = scrollY;
    }

    let lastScrollY = 0; // Variable, um die letzte Scrollposition zu speichern

});
