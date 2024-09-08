document.addEventListener('DOMContentLoaded', () => {
    let potentialPixelColors = []



    function updatePotentialPixelColors() {
        const rootStyles = getComputedStyle(document.body);
        potentialPixelColors = [
            rootStyles.getPropertyValue('--primary-color').trim(),
            rootStyles.getPropertyValue('--secondary-color').trim(),
            rootStyles.getPropertyValue('--accent-color').trim(),
            rootStyles.getPropertyValue('--text-color').trim()
        ];
    }

    updatePotentialPixelColors();

    const components = [
        { id: 'header', html: 'components/header.html', initFunc: initializeHeader },
        { id: 'pixel-background', html: 'components/pixel-background.html', initFunc: initializePixels },
        { id: 'cube', html: 'components/cube.html', css: 'css/cube.css', initFunc: initializeCube },
        { id: 'footer', html: 'components/footer.html', initFunc: initializeFooter }
    ];

    // Load components
    components.forEach(loadComponent);


    // Load common CSS files for all components
    function loadComponent({ id, html, css, initFunc }) {
        fetch(html)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;
                if (css) loadCSS(css);
                if (initFunc) initFunc();
            });
    }

    // Load CSS file for a component
    function loadCSS(file) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        document.head.appendChild(link);
    }

    // Function to get a random color from the current theme
    function getRandomColorFromTheme() {
        return potentialPixelColors[Math.floor(Math.random() * potentialPixelColors.length)];
    }

    // Create a pixel element
    function createPixel(container, options = {}) {
        let index = Math.floor(Math.random() * 4)
        // Default object options
        const {
            color = potentialPixelColors[index],
            top = Math.random() * window.innerHeight,
            left = Math.random() * window.innerWidth,
            speed = (Math.random() * 100 + 1).toFixed(2),
            isFooterPixel = false
        } = options;

        // Create pixel element
        const pixel = document.createElement('div');
        pixel.setAttribute("colorIndex", index)
        pixel.className = isFooterPixel ? 'footer-pixel' : 'pixel';
        pixel.style.cssText = `
            background-color: ${color};
            top: ${top}px;
            left: ${left}px;
        `;

        container.appendChild(pixel);

        return { element: pixel, top, left, speed };
    }

    // Adjust element count based on target FPS
    function adjustElementCount(elements, targetFPS, createFunc, removeFunc) {
        let lastTime = performance.now();
        let frame = 0;

        function checkFPS() {
            frame++;
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;
            if (elapsed > 1000) {
                const fps = (frame * 1000) / elapsed;
                console.log(`FPS: ${fps}`);
                if (fps < targetFPS) {
                    const newCount = Math.max(elements.length - 1, 0);
                    console.log(`Reducing element count to ${newCount}`);
                    removeFunc(elements, newCount);
                } else if (fps > targetFPS + 5 && elements.length < 100) {
                    console.log(`Increasing element count to ${elements.length + 1}`);
                    elements.push(createFunc());
                }
                frame = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(checkFPS);
        }
        requestAnimationFrame(checkFPS);
    }

    // Initialize pixel background
    function initializePixels() {
        const pixelContainer = document.getElementById('pixel-container');
        const pixels = Array.from({ length: 100 }, () => createPixel(pixelContainer));

        adjustElementCount(pixels, 60, () => createPixel(pixelContainer), removeExcessElements);

        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollDirection = scrollTop > lastScrollTop ? 1 : -1;
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

            pixels.forEach(updatePixelPosition(scrollDirection));
        });
    }

    // Update pixel position based on scroll direction
    function updatePixelPosition(scrollDirection) {
        return pixel => {
            pixel.top += parseFloat(pixel.speed) * scrollDirection;
            if (pixel.top > window.innerHeight) {
                pixel.top = -11;
            } else if (pixel.top < -11) {
                pixel.top = window.innerHeight;
            }
            pixel.element.style.top = `${pixel.top}px`;
        };
    }

    // Remove excess elements
    function removeExcessElements(elements, newCount) {
        elements.splice(newCount).forEach(element => element.element.remove());
    }

    // Initialize cube
    function initializeCube() {
        const cube = document.querySelector('.cube');
        const container = document.querySelector('.container');
        let maxScroll = document.body.scrollHeight - window.innerHeight;

        const updateCube = throttle(() => {
            const scrollPercent = window.scrollY / maxScroll;
            const scrollRotation = scrollPercent * 360;
            cube.style.transform = `rotateX(${scrollRotation}deg) rotateY(${scrollRotation}deg)`;
            container.style.transform = `translateY(${scrollPercent * 100}vh)`;
        });

        window.addEventListener('scroll', updateCube, { passive: true });
        window.addEventListener('resize', () => {
            maxScroll = document.body.scrollHeight - window.innerHeight;
        });

        updateCube();
    }

    // Initialize footer
    function initializeFooter() {
        const footer = document.querySelector('#footer');
        const footerPixelContainer = footer.querySelector('.footer-pixel-container');
        const glassmorphismFooter = footer.querySelector('.glassmorphism-footer');

        const footerHeight = footer.offsetHeight;
        const initialPosition = -footerHeight;
        const visiblePosition = 0;
        const slowFactor = 20;

        let footerPosition = initialPosition;
        footer.style.bottom = `${initialPosition}px`;

        const updateFooter = throttle(() => {
            const windowHeight = window.innerHeight;
            const maxScroll = document.body.scrollHeight - windowHeight;
            const scrollY = window.scrollY;

            footerPosition = Math.min(visiblePosition, initialPosition + scrollY / slowFactor);

            footerPixelContainer.style.bottom = `${footerPosition}px`;
            glassmorphismFooter.style.bottom = `${footerPosition}px`;

            updateFooterPixels(footerPixelContainer, scrollY, maxScroll);

            if (scrollY >= maxScroll - footerHeight) {
                footerPixelContainer.style.bottom = `${visiblePosition}px`;
                glassmorphismFooter.style.bottom = `${visiblePosition}px`;
            }
        });

        window.addEventListener('scroll', updateFooter, { passive: true });
        updateFooter();
    }

    function updateFooterPixels(footerPixelContainer, scrollY) {
        const pixelSize = 10;
        const minDistanceFromTop = 10;
        const pixelDensity = Math.floor(scrollY / 25);

        const existingPixels = Array.from(footerPixelContainer.getElementsByClassName('footer-pixel'));
        const pixelDifference = pixelDensity - existingPixels.length;

        if (pixelDifference > 0) {
            for (let i = 0; i < pixelDifference; i++) {
                createPixel(footerPixelContainer, {
                    top: minDistanceFromTop + Math.random() * (footerPixelContainer.offsetHeight - minDistanceFromTop - pixelSize),
                    left: Math.floor(Math.random() * Math.floor(footerPixelContainer.offsetWidth / pixelSize)) * pixelSize,
                    speed: 0,
                    isFooterPixel: true
                });
            }
        } else if (pixelDifference < 0) {
            for (let i = 0; i < -pixelDifference; i++) {
                const pixel = existingPixels.pop();
                if (pixel) pixel.remove();
            }
        }

        existingPixels.forEach(updateFooterPixelPosition(footerPixelContainer, pixelSize));
    }

    function updateFooterPixelPosition(footer, pixelSize) {
        return pixel => {
            let top = parseFloat(pixel.style.top);
            const left = parseFloat(pixel.style.left);
            const otherPixelsBelow = Array.from(footer.getElementsByClassName('footer-pixel')).filter(p =>
                parseFloat(p.style.left) === left && parseFloat(p.style.top) > top
            );

            const lowestPixelBelow = otherPixelsBelow.length > 0
                ? Math.min(...otherPixelsBelow.map(p => parseFloat(p.style.top)))
                : footer.offsetHeight;

            const fallDistance = Math.min(lowestPixelBelow - pixelSize, footer.offsetHeight - pixelSize);

            top = top + 2 <= fallDistance ? top + 2 : fallDistance;
            pixel.style.top = `${top}px`;
        };
    }

    function throttle(func, limit = 16) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function updatePixelColors() {
        // Header-Pixel
        const headerPixels = document.querySelectorAll('.header-pixel, .pixel-header-attribute');
        headerPixels.forEach(pixel => {
            pixel.style.backgroundColor = pixel.getAttribute("colorIndex") ? potentialPixelColors[parseInt(pixel.getAttribute("colorIndex"))] : getRandomColorFromTheme();
        });

        // Footer-Pixel
        const footerPixels = document.querySelectorAll('.footer-pixel');
        footerPixels.forEach(pixel => {
            pixel.style.backgroundColor = pixel.getAttribute("colorIndex") ? potentialPixelColors[parseInt(pixel.getAttribute("colorIndex"))] : getRandomColorFromTheme();
        });

        // Background-Pixel
        const backgroundPixels = document.querySelectorAll('.pixel');
        backgroundPixels.forEach(pixel => {
            pixel.style.backgroundColor = pixel.getAttribute("colorIndex") ? potentialPixelColors[parseInt(pixel.getAttribute("colorIndex"))] : getRandomColorFromTheme();
        });
    }

    function setTheme(themeName) {
        document.body.className = themeName; 
        localStorage.setItem('selectedTheme', themeName); 
        updatePotentialPixelColors(); 
        updatePixelColors(); 
    }



    function initializeHeader() {
        const header = document.querySelector('.glassmorphism-header');
        const pixelContainer = document.querySelector('.header-pixel-container');
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            setTheme(savedTheme); 
        } else {
            setTheme('theme-default'); 
        }

        if (!header || !pixelContainer) {
            console.error('Header oder Pixel-Container-Element nicht gefunden');
            return;
        }

        header.style.height = '80px';
        const headerHeight = header.offsetHeight;
        const headerWidth = header.offsetWidth;
        const containerPadding = 10;

        pixelContainer.style.position = 'fixed';  
        pixelContainer.style.top = '0';
        pixelContainer.style.left = '0';
        pixelContainer.style.width = '100%';
        pixelContainer.style.height = `${headerHeight - containerPadding}px`;
        pixelContainer.style.overflow = 'hidden';
        pixelContainer.style.pointerEvents = 'none';


        initializeHeaderPixels(pixelContainer, headerWidth, headerHeight);

        // Theme-Dropdown-Logik

        const themeLinks = document.querySelectorAll('.theme-dropdown-content a');
        themeLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const selectedTheme = event.target.dataset.theme;
                const themes = ['theme-default', 'theme-dark', 'theme-monochromatic', 'theme-vaporwave', 'theme-colorful', 'theme-pastel'];
                document.body.classList.remove(...themes);
                document.body.classList.add(`theme-${selectedTheme}`);
                setTheme(`theme-${selectedTheme}`);
                updatePotentialPixelColors();
                updatePixelColors();

            });
        });
    }

    function initializeHeaderPixels(container, width, height) {
        const pixelSize = 10;
        const containerPadding = 10; 
        const containerHeight = height - containerPadding;
        let pixels = [];
        const columns = Math.floor(width / pixelSize);
        const rows = Math.floor(containerHeight / pixelSize);


        const pixelGrid = Array(columns).fill().map(() => Array(rows).fill(null));

        function createInitialPixels() {
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < columns; x++) {
                    const pixel = createPixel(container, {
                        top: y * pixelSize,
                        left: x * pixelSize,
                    });

                    pixel.element.dataset.originalX = x;
                    pixel.element.dataset.originalY = y;
                    pixel.element.dataset.currentX = x;
                    pixel.element.dataset.currentY = y;
                    pixel.element.dataset.state = 'static';
                    pixels.push(pixel);
                    pixelGrid[x][y] = pixel;
                }
            }
        }

        createInitialPixels();

        let lastScrollY = window.scrollY;
        let scrollIntensity = 0;
        let scrollDirection = 0;

        function updateHeaderPixels() {
            if (scrollDirection > 0) {
      
                const bottomRow = pixels.filter(p => parseInt(p.element.dataset.currentY) === rows - 1 && p.element.dataset.state === 'static');
                const fallingCandidates = bottomRow.length > 0 ? bottomRow :
                    pixels.filter(p => {
                        const x = parseInt(p.element.dataset.currentX);
                        const y = parseInt(p.element.dataset.currentY);
                        return y < rows - 1 && pixelGrid[x][y + 1] === null && p.element.dataset.state === 'static';
                    });


                const maxFallingPixels = 3; 
                const pixelsToFall = fallingCandidates
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.min(
                        maxFallingPixels,
                        Math.ceil(fallingCandidates.length * scrollIntensity * 0.05)
                    ));

                pixelsToFall.forEach(pixel => {
                    const x = parseInt(pixel.element.dataset.currentX);
                    const y = parseInt(pixel.element.dataset.currentY);
                    pixel.element.dataset.state = 'falling';
                    pixelGrid[x][y] = null;
                });
            } else if (scrollDirection < 0) {

                const emptyTopSlots = pixelGrid.map((column, x) => {
                    const y = column.findIndex(pixel => pixel === null);
                    return y !== -1 ? { x, y } : null;
                }).filter(slot => slot !== null);


                const maxNewPixels = 3; 
                const slotsToFill = emptyTopSlots
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.min(
                        maxNewPixels,
                        Math.ceil(emptyTopSlots.length * scrollIntensity * 0.05)
                    ));

                slotsToFill.forEach(({ x, y }) => {
                    const newPixel = createPixel(container, {
                        top: y * pixelSize,
                        left: x * pixelSize,
                        size: pixelSize,
                        color: getRandomColorFromTheme()
                    });

                    newPixel.element.dataset.originalX = x;
                    newPixel.element.dataset.originalY = y;
                    newPixel.element.dataset.currentX = x;
                    newPixel.element.dataset.currentY = y;
                    newPixel.element.dataset.state = 'static';
                    pixels.push(newPixel);
                    pixelGrid[x][y] = newPixel;
                });
            }


            pixels = pixels.filter(pixel => {
                const state = pixel.element.dataset.state;
                if (state === 'falling') {
                    let y = parseFloat(pixel.element.style.top);
                    y += scrollIntensity * 2;
                    if (y >= height) {
  
                        pixel.element.remove();
                        return false;
                    }
                    pixel.element.style.top = `${y}px`;
                    pixel.element.dataset.currentY = Math.floor(y / pixelSize);
                }
                return true;
            });

            requestAnimationFrame(updateHeaderPixels);
        }

        updateHeaderPixels();

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY;

            scrollDirection = Math.sign(scrollDelta);
            scrollIntensity = Math.min(Math.abs(scrollDelta) / 10, 5);

            setTimeout(() => {
                scrollIntensity = Math.max(scrollIntensity - 0.5, 0);
                if (scrollIntensity === 0) scrollDirection = 0;
            }, 100);

            lastScrollY = currentScrollY;
        });
    }


});