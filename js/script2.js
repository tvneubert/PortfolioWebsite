document.addEventListener('DOMContentLoaded', () => {
    const components = [
        { id: 'header', html: 'components/header.html', css: 'css/header.css', initFunc: initializeHeader },
        { id: 'pixel-background', html: 'components/pixel-background.html', initFunc: initializePixels },
        { id: 'cube', html: 'components/cube.html', css: 'css/cube.css', initFunc: initializeCube },
        { id: 'footer', html: 'components/footer.html', css: 'css/footer.css', initFunc: initializeFooter }
    ];

    // Load components
    components.forEach(loadComponent);

    // Load common CSS files for all components (if any) 
    function loadComponent({ id, html, css, initFunc }) {
        fetch(html)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;
                if (css) loadCSS(css);
                if (initFunc) initFunc();
            });
    }

    // Load CSS file for a component (if any)
    function loadCSS(file) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = file;
        document.head.appendChild(link);
    }

    // Random color generator
    function getRandomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    // Create a pixel element
    function createPixel(container, options = {}) {
        // Default object options
        const {
            size = 10,
            color = getRandomColor(),
            top = Math.random() * window.innerHeight,
            left = Math.random() * window.innerWidth,
            speed = (Math.random() * 100 + 1).toFixed(2),
            isFooterPixel = false
        } = options;

        // Create pixel element
        const pixel = document.createElement('div');
        pixel.className = isFooterPixel ? 'footer-pixel' : 'pixel';
        pixel.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
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
        const footer = document.querySelector('.footer');
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
            footer.style.bottom = `${footerPosition}px`;

            updateFooterPixels(footer, scrollY, maxScroll);

            if (scrollY >= maxScroll - footerHeight) {
                footer.style.bottom = `${visiblePosition}px`;
            }
        });

        window.addEventListener('scroll', updateFooter, { passive: true });
        updateFooter();
    }

    function updateFooterPixels(footer, scrollY) {
        const pixelSize = 10;
        const minDistanceFromTop = 10;
        const pixelDensity = Math.floor(scrollY / 25);

        const existingPixels = Array.from(footer.getElementsByClassName('footer-pixel'));
        const pixelDifference = pixelDensity - existingPixels.length;

        if (pixelDifference > 0) {
            for (let i = 0; i < pixelDifference; i++) {
                createPixel(footer, {
                    top: minDistanceFromTop + Math.random() * (footer.offsetHeight - minDistanceFromTop - pixelSize),
                    left: Math.floor(Math.random() * Math.floor(footer.offsetWidth / pixelSize)) * pixelSize,
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

        existingPixels.forEach(updateFooterPixelPosition(footer, pixelSize));
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
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function initializeHeader() {
        const progressBar = document.querySelector('.progress-bar');
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.desktop-nav a');
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
        if (!progressBar || !sections.length || !navLinks.length) {
            console.error('Header components are missing.');
            return;
        }
    
        function throttle(func, limit = 16) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    
        function updateProgressBar() {
            const scrollPosition = window.scrollY;
            const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollPosition / pageHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    
        function highlightCurrentSection() {
            let currentSectionId = '';
    
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
    
                if (window.scrollY >= sectionTop - sectionHeight / 3) {
                    currentSectionId = section.getAttribute('id');
                }
            });
    
            navLinks.forEach((link) => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === currentSectionId) {
                    link.classList.add('active');
                }
            });
    
            mobileNavItems.forEach((item, index) => {
                const sectionId = sections[index].getAttribute('id');
                item.classList.remove('active');
                if (sectionId === currentSectionId) {
                    item.classList.add('active');
                }
            });
        }
    
        const handleScroll = throttle(() => {
            requestAnimationFrame(() => {
                updateProgressBar();
                highlightCurrentSection();
            });
        });
    
        window.addEventListener('scroll', handleScroll);
        handleScroll();  // Initial run to set everything up
    }
     
       
});