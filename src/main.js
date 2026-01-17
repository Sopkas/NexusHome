        // ===== CURSOR =====
        const cursor = document.querySelector('.cursor');
        const cursorDot = document.querySelector('.cursor-dot');
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        document.querySelectorAll('a, button, .service-card, .advantage-card, .testimonial-card, .stat-card, .hotspot').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        // ===== PARTICLES =====
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const particleCount = 80;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(77, 225, 196, 0.6)';
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.update();
                p.draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(77, 225, 196, ${0.15 * (1 - dist / 120)})`;
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // ===== NAVIGATION =====
        const nav = document.querySelector('nav');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        });

        // ===== SCROLL REVEAL =====
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '-50px' });

        document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
            revealObserver.observe(el);
        });

        // ===== SMART HOME HOTSPOTS =====
        const smartHome = document.getElementById('smartHome');
        const hotspots = document.querySelectorAll('.hotspot');
        const tooltips = {
            bed: document.getElementById('tooltip-bed'),
            light: document.getElementById('tooltip-light'),
            temp: document.getElementById('tooltip-temp'),
            curtain: document.getElementById('tooltip-curtain')
        };

        const lightLevels = [20, 40, 60, 80, 100];
        const defaultLightLevel = 80;
        let lightIndex = lightLevels.indexOf(defaultLightLevel);
        if (lightIndex === -1) lightIndex = lightLevels.length - 1;
        const lightValueEl = tooltips.light ? tooltips.light.querySelector('.tooltip-value') : null;

        const setLightLevel = (percent) => {
            const clamped = Math.max(0, Math.min(100, percent));
            if (lightValueEl) {
                lightValueEl.textContent = `${clamped}%`;
            }
            const intensity = clamped / 100;
            smartHome.style.setProperty('--light-intensity', intensity.toFixed(2));
            smartHome.style.setProperty('--light-intensity-low', (intensity * 0.5).toFixed(2));
            smartHome.style.setProperty('--light-rays', (intensity * 0.85).toFixed(2));
            smartHome.style.setProperty('--light-rays-low', (intensity * 0.25).toFixed(2));
        };

        setLightLevel(defaultLightLevel);

        // Hotspot interactions
        hotspots.forEach(hotspot => {
            const type = hotspot.dataset.type;

            hotspot.addEventListener('mouseenter', () => {
                // Add active class to container
                smartHome.classList.add(`${type}-active`);

                // Show tooltip
                if (tooltips[type]) {
                    tooltips[type].classList.add('active');
                }

                // Update tooltip value for curtain
                if (type === 'curtain') {
                    const valueEl = tooltips[type].querySelector('.tooltip-value');
                    valueEl.textContent = 'Открыты';
                    valueEl.classList.add('active');
                }
            });

            hotspot.addEventListener('mouseleave', () => {
                // Remove active class
                smartHome.classList.remove(`${type}-active`);

                // Hide tooltip
                if (tooltips[type]) {
                    tooltips[type].classList.remove('active');
                }

                // Reset curtain tooltip
                if (type === 'curtain') {
                    const valueEl = tooltips[type].querySelector('.tooltip-value');
                    valueEl.textContent = 'Закрыты';
                    valueEl.classList.remove('active');
                }
            });

            // Click to toggle state
            hotspot.addEventListener('click', () => {
                if (type === 'light') {
                    lightIndex = (lightIndex + 1) % lightLevels.length;
                    setLightLevel(lightLevels[lightIndex]);
                    return;
                }

                hotspot.classList.toggle('toggled');

                if (type === 'temp') {
                    const valueEl = tooltips[type].querySelector('.tooltip-value');
                    const isWarm = hotspot.classList.contains('toggled');
                    valueEl.textContent = isWarm ? '26°C' : '24°C';
                }
            });
        });

        // ===== SCENE PANEL =====
        const scenePanel = document.querySelector('.scene-panel-card');
        if (scenePanel) {
            const sceneTabs = Array.from(scenePanel.querySelectorAll('.scene-tab'));
            const sceneTitle = scenePanel.querySelector('[data-scene-title]');
            const sceneRoom = scenePanel.querySelector('[data-scene-room]');
            const sceneSubtitle = scenePanel.querySelector('[data-scene-subtitle]');
            const sceneStatus = scenePanel.querySelector('[data-scene-status]');
            const sceneStatusText = scenePanel.querySelector('.scene-status-text');
            const tempRange = scenePanel.querySelector('[data-range="temp"]');
            const tempValue = scenePanel.querySelector('[data-temp-value]');
            const tempLabel = scenePanel.querySelector('[data-temp-label]');
            const lightRange = scenePanel.querySelector('[data-range="light"]');
            const lightValue = scenePanel.querySelector('[data-light-value]');
            const lightLabel = scenePanel.querySelector('[data-light-label]');
            const mediaTitle = scenePanel.querySelector('[data-media-title]');
            const mediaSubtitle = scenePanel.querySelector('[data-media-subtitle]');

            const updateRangeFill = (range) => {
                if (range) {
                    range.style.setProperty('--value', range.value);
                }
            };

            const updateTemp = (value) => {
                const temp = Number(value);
                if (Number.isNaN(temp)) return;
                if (tempValue) {
                    tempValue.textContent = `${temp}\u00B0`;
                }
                if (tempLabel) {
                    tempLabel.textContent = temp <= 18 ? 'Прохладно' : temp <= 22 ? 'Комфорт' : 'Тепло';
                }
                if (tempRange) {
                    const min = Number(tempRange.min) || 16;
                    const max = Number(tempRange.max) || 28;
                    const ratio = Math.min(1, Math.max(0, (temp - min) / (max - min)));
                    const hue = 210 - (210 * ratio);
                    const color = `hsl(${hue} 85% 60%)`;
                    tempRange.style.setProperty('--temp-accent', color);
                    tempRange.value = temp;
                    updateRangeFill(tempRange);
                }
            };

            const updateLight = (value, labelOverride) => {
                const light = Number(value);
                if (Number.isNaN(light)) return;
                if (lightValue) {
                    lightValue.textContent = `${light}%`;
                }
                if (lightLabel) {
                    lightLabel.textContent = labelOverride || (light <= 20 ? 'Ночник' : light <= 60 ? 'Мягкий' : 'Основной');
                }
                if (lightRange) {
                    lightRange.value = light;
                    updateRangeFill(lightRange);
                }
                scenePanel.style.setProperty('--panel-light', (light / 100).toFixed(2));
            };

            const applyScene = (tab) => {
                sceneTabs.forEach(btn => {
                    const isActive = btn === tab;
                    btn.classList.toggle('active', isActive);
                    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });

                if (sceneTitle) sceneTitle.textContent = tab.dataset.title || 'Сцена';
                if (sceneRoom) sceneRoom.textContent = tab.dataset.room || 'Комната';
                if (sceneSubtitle) sceneSubtitle.textContent = tab.dataset.subtitle || '';
                if (mediaTitle) mediaTitle.textContent = tab.dataset.media || 'System Silent';
                if (mediaSubtitle) mediaSubtitle.textContent = tab.dataset.mediaSubtitle || 'Мультимедиа';

                const status = (tab.dataset.status || 'online').toLowerCase();
                if (sceneStatus) {
                    sceneStatus.classList.toggle('offline', status === 'offline');
                }
                if (sceneStatusText) {
                    sceneStatusText.textContent = status === 'offline' ? 'Offline' : 'Online';
                }

                updateTemp(tab.dataset.temp || (tempRange ? tempRange.value : 20));
                updateLight(tab.dataset.light || (lightRange ? lightRange.value : 40), tab.dataset.lightLabel);
            };

            sceneTabs.forEach(tab => {
                tab.addEventListener('click', () => applyScene(tab));
            });

            if (tempRange) {
                tempRange.addEventListener('input', (event) => updateTemp(event.target.value));
                updateRangeFill(tempRange);
            }

            if (lightRange) {
                lightRange.addEventListener('input', (event) => updateLight(event.target.value));
                updateRangeFill(lightRange);
            }

            scenePanel.querySelectorAll('.scene-toggle').forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const isOn = toggle.getAttribute('aria-pressed') === 'true';
                    toggle.setAttribute('aria-pressed', isOn ? 'false' : 'true');
                    const stateEl = toggle.querySelector('.scene-toggle-state');
                    const onText = toggle.dataset.on || 'Вкл';
                    const offText = toggle.dataset.off || 'Выкл';
                    if (stateEl) {
                        stateEl.textContent = isOn ? offText : onText;
                    }
                });
            });

            const initialTab = scenePanel.querySelector('.scene-tab.active') || sceneTabs[0];
            if (initialTab) {
                applyScene(initialTab);
            }
        }

        // ===== PROJECT CALCULATOR MODAL =====
        const projectModal = document.getElementById('projectModal');
        const projectOpenBtn = document.getElementById('projectCalcBtn');

        if (projectModal && projectOpenBtn) {
            const projectForm = document.getElementById('projectCalcForm');
            const closeButtons = projectModal.querySelectorAll('[data-project-close]');
            const areaRange = projectModal.querySelector('[data-project-range="area"]');
            const roomsRange = projectModal.querySelector('[data-project-range="rooms"]');
            const areaValue = projectModal.querySelector('[data-project-area]');
            const roomsValue = projectModal.querySelector('[data-project-rooms]');
            const timelineSelect = projectModal.querySelector('[data-project-select="timeline"]');
            const priceEl = projectModal.querySelector('[data-project-price]');
            const minEl = projectModal.querySelector('[data-project-min]');
            const maxEl = projectModal.querySelector('[data-project-max]');
            const weeksEl = projectModal.querySelector('[data-project-weeks]');
            const devicesEl = projectModal.querySelector('[data-project-devices]');
            const scenesEl = projectModal.querySelector('[data-project-scenes]');

            const updateRangeFill = (range) => {
                if (!range) return;
                const min = Number(range.min) || 0;
                const max = Number(range.max) || 100;
                const value = Number(range.value) || 0;
                const percent = ((value - min) / (max - min)) * 100;
                range.style.setProperty('--value', percent.toFixed(0));
            };

            const formatCurrency = (value) => new Intl.NumberFormat('ru-RU').format(Math.round(value));

            const calculateProject = () => {
                const type = projectModal.querySelector('input[name="project-type"]:checked')?.value || 'apartment';
                const level = projectModal.querySelector('input[name="project-level"]:checked')?.value || 'base';
                const timeline = timelineSelect ? timelineSelect.value : 'standard';
                const area = Number(areaRange?.value || 85);
                const rooms = Number(roomsRange?.value || 3);

                if (areaValue) areaValue.textContent = `${area} м²`;
                if (roomsValue) roomsValue.textContent = `${rooms}`;

                const baseRate = {
                    apartment: 9500,
                    house: 12000,
                    office: 14000
                };
                const levelFactor = {
                    base: 1,
                    pro: 1.25,
                    elite: 1.6
                };
                const timelineFactor = {
                    standard: 1,
                    priority: 1.12,
                    express: 1.22
                };

                const roomsFactor = 1 + (rooms - 1) * 0.08;
                const raw = area * (baseRate[type] || 9500) * (levelFactor[level] || 1) * roomsFactor * (timelineFactor[timeline] || 1);
                const min = raw * 0.92;
                const max = raw * 1.08;
                const avg = (min + max) / 2;

                if (priceEl) priceEl.textContent = `${formatCurrency(avg)} ₽`;
                if (minEl) minEl.textContent = `${formatCurrency(min)} ₽`;
                if (maxEl) maxEl.textContent = `${formatCurrency(max)} ₽`;

                let baseWeeks = Math.max(2, Math.round(area / 38));
                baseWeeks += level === 'elite' ? 2 : level === 'pro' ? 1 : 0;
                baseWeeks += timeline === 'express' ? -1 : timeline === 'priority' ? 0 : 1;
                baseWeeks = Math.max(2, baseWeeks);
                const weekMin = Math.max(2, baseWeeks - 1);
                const weekMax = baseWeeks + 1;

                if (weeksEl) weeksEl.textContent = `${weekMin}-${weekMax} нед`;

                const devices = Math.max(8, Math.round(area / 6 + rooms * 2 + (level === 'elite' ? 8 : level === 'pro' ? 4 : 0)));
                const scenes = Math.max(6, Math.round(rooms * 4 + (level === 'elite' ? 12 : level === 'pro' ? 7 : 4)));

                if (devicesEl) devicesEl.textContent = `${devices}`;
                if (scenesEl) scenesEl.textContent = `${scenes}`;
            };

            const openModal = () => {
                projectModal.classList.add('open');
                projectModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                calculateProject();
            };

            const closeModal = () => {
                projectModal.classList.remove('open');
                projectModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            };

            projectOpenBtn.addEventListener('click', openModal);
            closeButtons.forEach(btn => btn.addEventListener('click', closeModal));

            projectModal.addEventListener('click', (event) => {
                if (event.target === projectModal) {
                    closeModal();
                }
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && projectModal.classList.contains('open')) {
                    closeModal();
                }
            });

            const inputElements = projectModal.querySelectorAll('input[name="project-type"], input[name="project-level"], [data-project-range], [data-project-select="timeline"]');
            inputElements.forEach(el => {
                el.addEventListener('input', () => {
                    if (el.matches('[data-project-range]')) {
                        updateRangeFill(el);
                    }
                    calculateProject();
                });
                el.addEventListener('change', calculateProject);
            });

            updateRangeFill(areaRange);
            updateRangeFill(roomsRange);
            calculateProject();

            if (projectForm) {
                projectForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const submitBtn = projectForm.querySelector('.project-submit');
                    if (!submitBtn) return;
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Заявка отправлена';
                    submitBtn.disabled = true;
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        closeModal();
                    }, 1800);
                });
            }
        }

        // Parallax for orbs
        document.addEventListener('mousemove', (e) => {
            const mx = e.clientX / window.innerWidth - 0.5;
            const my = e.clientY / window.innerHeight - 0.5;

            document.querySelectorAll('.parallax-orb').forEach((orb, i) => {
                const speed = (i + 1) * 15;
                orb.style.transform = `translate(${mx * speed}px, ${my * speed}px)`;
            });
        });

        // ===== FORM SUBMISSION =====
        document.querySelector('.contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('.submit-btn');
            const original = btn.textContent;

            btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Отправка...</span>';

            setTimeout(() => {
                btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Отправлено!</span>';
                btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

                setTimeout(() => {
                    btn.textContent = original;
                    btn.style.background = '';
                    e.target.reset();
                }, 3000);
            }, 1500);
        });

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
        document.head.appendChild(style);

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
