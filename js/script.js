document.addEventListener('DOMContentLoaded', () => {
    // Laden der Komponenten
    loadComponent('header', 'components/header.html', 'css/header.css');
    loadComponent('pixel-background', 'components/pixel-background.html');
    loadComponent('cube', 'components/cube.html', 'css/cube.css');
    loadComponent('footer', 'components/footer.html', 'css/footer.css');

    // Funktion zum Laden von HTML-Dateien
    function loadComponent(id, file, cssFile) {
        fetch(file)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;

                // CSS-Datei laden, falls angegeben
                if (cssFile) {
                    loadCSS(cssFile);
                }

                switch (id) {
                    case 'pixel-background':
                        initializePixels();
                        break;
                    case 'cube':
                        initializeCube();
                        break;
                    case 'footer':
                        moveFooter();
                        break;
                    default:
                        break;
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

        // Pixel erstellen
        const pixels = createPixels(pixelContainer, numberOfPixels);

        // FPS überprüfen und Anzahl der Pixel anpassen	
        adjustPixelCount(pixels);

        // Scroll-Event für Pixel-Bewegung
        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollDirection = scrollTop > lastScrollTop ? 1 : -1; // 1 für nach unten, -1 für nach oben
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Für Mobile oder negative Werte

            pixels.forEach(pixel => {
                const speed = pixel.speed;
                pixel.top += speed * scrollDirection;

                if (pixel.top > window.innerHeight) {
                    // Wenn der Pixel unten angekommen ist, nach oben zurücksetzen
                    pixel.top = -11; // <-11px damit er leicht außerhalb des sichtbaren Bereichs beginnt
                } else if (pixel.top < -11) {
                    // Wenn der Pixel oben angekommen ist, nach unten zurücksetzen
                    pixel.top = window.innerHeight;
                }

                pixel.element.style.top = pixel.top + 'px';

            });
        });
    }

    // Pixel erstellen
    function createPixels(pixelContainer, numberOfPixels) {
        const pixels = [];

        for (let i = 0; i < numberOfPixels; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.position = 'absolute';
            pixel.style.backgroundColor = getRandomColor();

            const top = Math.random() * window.innerHeight;
            const left = Math.random() * window.innerWidth;
            const speed = (Math.random() * 100 + 1).toFixed(2);

            pixel.style.top = top + 'px';
            pixel.style.left = left + 'px';

            pixels.push({ element: pixel, top, left, speed });
            pixelContainer.appendChild(pixel);
        }

        return pixels;
    }

    //Anzahl Pixel auf Endgerät anpassen
    function adjustPixelCount(pixels) {
        const tragetFPS = 60;
        let lastTime = performance.now();
        let frame = 0;

        function checkFPS() {
            frame++;
            const currenTime = performance.now();
            const elapsed = currenTime - lastTime;
            if (elapsed > 1000) {
                const fps = frame * 1000 / elapsed;
                console.log(`FPS: ${fps}`);
                if (fps < tragetFPS) {
                    // Bildwiderholungsrate ist zu niedrig, Anzahl Pixel reduzieren
                    const newNumberOfPixels = Math.max(pixels.length - 1, 0);
                    console.log(`Reducing pixel count to ${newNumberOfPixels}`);
                    removeExcessPixels(pixels, newNumberOfPixels);
                }
                frame;
                lastTime = currenTime;
            }
            requestAnimationFrame(checkFPS);
        }
        requestAnimationFrame(checkFPS);
    }

    // Überzählige Pixel entfernen
    function removeExcessPixels(pixels, newNumberOfPixels) {
        const excess = pixels.length - newNumberOfPixels;
        for(let i = 0; i < excess; i++) {
            const pixel = pixels.pop();
            pixel.element.remove();
        }
    }

    // Cube generieren
    function initializeCube() {
        const cube = document.querySelector('.cube');
        const container = document.querySelector('.container');
        let scrollRotation = 0;
        let maxScroll = document.body.scrollHeight - window.innerHeight;
        let ticking = false;

        function updateElements(scrollPercent) {
            scrollRotation = scrollPercent * 360;
            cube.style.transform = `rotateX(${scrollRotation}deg) rotateY(${scrollRotation}deg)`;
            container.style.transform = `translateY(${scrollPercent * 100}vh)`;
        }

        function onScoll() {
            if(!ticking) {
                requestAnimationFrame(() => {
                    const scrollPercent = window.scrollY / maxScroll;
                    updateElements(scrollPercent);
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScoll, { passive: true });
        window.addEventListener('resize', () => {
            maxScroll = document.body.scrollHeight - window.innerHeight;
        });

        onScoll();
    }

    function moveFooter() {
        const footer = document.querySelector('.footer');
        const footerHeight = footer.offsetHeight;
        const initialPosition = -footerHeight;
        const visiblePosition = 0;
        const slowFactor = 20; // Je größer der Wert, desto langsamer bewegt sich der Footer

        let ticking = false;
        let lastScrollY = 0;
        let footerPosition = initialPosition;

        footer.style.bottom = `${initialPosition}px`;

        function updateFooter() {
            const windowHeight = window.innerHeight;
            const maxScroll = document.body.scrollHeight - windowHeight;
            const scrollY = window.scrollY;

            // Berechnung der Footer-Position
            footerPosition = Math.min(visiblePosition, initialPosition + scrollY / slowFactor);

            // Setzen der Footer-Position
            footer.style.bottom = `${footerPosition}px`;

            // Wenn der Footer sichtbar wird, fülle ihn relativ zum Scroll-Event mit Pixeln
            updateFooterPixels(footer, scrollY, maxScroll);

            // Wenn der Footer komplett sichtbar ist, bleibt er fixiert am unteren Rand
            if (scrollY >= maxScroll - footerHeight) {
                footer.style.bottom = `${visiblePosition}px`;
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                requestAnimationFrame(updateFooter);
                ticking = true;
            }

        }, { passive: true });

        // Initialisierung
        updateFooter();
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

});
