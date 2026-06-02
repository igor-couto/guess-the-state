(function () {
    function createCountryGame(config) {
        const elements = {};
        const state = {
            completed: 0,
            mistakes: 0,
            selectedRegionId: null,
            mapSvg: null,
            regions: [],
            guessableRegions: [],
            remainingRegionIds: new Set(),
            flashTimer: null
        };

        const regionById = new Map(
            (config.regions || []).map(region => [region.id, region])
        );

        const sounds = Object.fromEntries(
            Object.entries(config.sounds || {}).map(([key, src]) => [key, new Audio(src)])
        );

        document.addEventListener("DOMContentLoaded", init);

        async function init() {
            cacheElements();
            setTotal();
            bindInput();
            createFeedbackElements();

            try {
                state.mapSvg = await loadMap();
                prepareRegions();
                selectRandomRegion({ silent: true });
            } catch (error) {
                showMapError();
                console.error(error);
            }
        }

        function cacheElements() {
            elements.map = document.querySelector(config.map.containerSelector);
            elements.input = document.querySelector(config.elements.inputSelector);
            elements.button = document.querySelector(config.elements.buttonSelector);
            elements.completed = document.querySelector(config.elements.completedSelector);
            elements.total = document.querySelector(config.elements.totalSelector);
            elements.mistakes = document.querySelector(config.elements.mistakesSelector);

            if (!elements.map || !elements.input || !elements.button) {
                throw new Error("Country game is missing required DOM elements.");
            }
        }

        function setTotal() {
            if (elements.total) {
                elements.total.textContent = String(config.regions.length);
            }
        }

        function bindInput() {
            elements.button.addEventListener("click", validateAnswer);
            elements.input.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    validateAnswer();
                }
            });
        }

        async function loadMap() {
            if (config.map.svgText) {
                return renderMap(config.map.svgText);
            }

            if (config.map.src) {
                if (window.location.protocol !== "file:") {
                    try {
                        const response = await fetch(config.map.src);
                        if (!response.ok) {
                            throw new Error(`Could not load map from ${config.map.src}.`);
                        }

                        return renderMap(await response.text());
                    } catch (error) {
                        const fallbackSvg = await loadFallbackSvg();
                        if (!fallbackSvg) {
                            throw error;
                        }

                        console.warn(error);
                        return renderMap(fallbackSvg);
                    }
                }

                const fallbackSvg = await loadFallbackSvg();
                if (fallbackSvg) {
                    return renderMap(fallbackSvg);
                }

                throw new Error(`Map source ${config.map.src} cannot be loaded from a local file.`);
            }

            const inlineSvg = elements.map.querySelector("svg");
            if (inlineSvg) return inlineSvg;
            throw new Error("Country game map source was not configured.");
        }

        // Browsers block fetch() on file://, so the map can't be fetched when
        // index.html is opened without a server. The fallback SVG is shipped as
        // a script (window[fallbackGlobal]) that IS loadable over file://, and
        // is injected lazily here so HTTP visitors never download it.
        async function loadFallbackSvg() {
            if (config.map.fallbackSvgText) {
                return config.map.fallbackSvgText;
            }

            const { fallbackScriptSrc, fallbackGlobal } = config.map;
            if (!fallbackScriptSrc || !fallbackGlobal) {
                return null;
            }

            if (!window[fallbackGlobal]) {
                await loadScript(fallbackScriptSrc);
            }

            return window[fallbackGlobal] || null;
        }

        function loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Could not load fallback script ${src}.`));
                document.head.appendChild(script);
            });
        }

        function renderMap(svgText) {
            elements.map.innerHTML = svgText;
            const mapSvg = elements.map.querySelector("svg");
            if (!mapSvg) {
                throw new Error("Map source did not contain an SVG.");
            }

            mapSvg.id = config.map.svgId || "map-svg";
            mapSvg.setAttribute("role", "img");
            mapSvg.setAttribute("aria-label", config.map.ariaLabel);

            return mapSvg;
        }

        function prepareRegions() {
            state.regions = Array.from(state.mapSvg.querySelectorAll(config.map.regionsSelector));
            const configuredIds = new Set(config.regions.map(region => region.id));
            state.guessableRegions = state.regions.filter(region => configuredIds.has(region.id));

            state.guessableRegions.forEach(region => {
                state.remainingRegionIds.add(region.id);
                region.classList.add("guessable-region");
                region.setAttribute("tabindex", "0");
                region.setAttribute("role", "button");
                region.setAttribute("aria-disabled", "false");
                region.setAttribute("aria-label", getRegionLabel(region.id));
                region.addEventListener("click", () => selectRegion(region.id));
                region.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectRegion(region.id);
                    }
                });
            });
        }

        function selectRegion(regionId, options = {}) {
            const region = getRegionElement(regionId);
            if (!region || !state.remainingRegionIds.has(regionId)) return;

            if (!options.silent) {
                playSound("select");
            }

            clearSelectedRegion();

            state.selectedRegionId = regionId;
            setTransformOrigin(region);
            region.classList.add("selected-state");
            elements.input.focus();
        }

        function clearSelectedRegion() {
            if (!state.selectedRegionId) return;

            const previousRegion = getRegionElement(state.selectedRegionId);
            if (previousRegion) {
                previousRegion.classList.remove("selected-state");
            }
        }

        function setTransformOrigin(region) {
            const bbox = region.getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            region.style.transformOrigin = `${centerX}px ${centerY}px`;
        }

        function validateAnswer() {
            if (!state.selectedRegionId || !elements.input.value.trim()) return;

            if (isCorrectAnswer(state.selectedRegionId, elements.input.value)) {
                markCorrectAnswer();
            } else {
                markWrongAnswer();
            }
        }

        function markCorrectAnswer() {
            const region = getRegionElement(state.selectedRegionId);
            if (!region) return;

            playSound("correct");
            announce(`Correct. ${getRegionLabel(state.selectedRegionId)}.`);
            flashInput("is-correct");
            state.completed += 1;
            state.remainingRegionIds.delete(state.selectedRegionId);

            elements.completed.textContent = String(state.completed);
            elements.input.value = "";

            region.classList.remove("selected-state");
            region.classList.add("completed-state");
            region.removeAttribute("tabindex");
            region.setAttribute("aria-disabled", "true");
            region.style.cursor = "auto";
            region.style.fill = getOpaqueFill(region);

            state.selectedRegionId = null;
            selectRandomRegion({ silent: true });
        }

        function markWrongAnswer() {
            playSound("error");
            announce("Not quite. Try again.");
            flashInput("is-wrong");
            state.mistakes += 1;
            elements.mistakes.textContent = String(state.mistakes);
        }

        function selectRandomRegion(options = {}) {
            const remainingRegionIds = Array.from(state.remainingRegionIds);
            if (remainingRegionIds.length === 0) {
                showCompletion();
                return;
            }

            const randomIndex = Math.floor(Math.random() * remainingRegionIds.length);
            selectRegion(remainingRegionIds[randomIndex], options);
        }

        function isCorrectAnswer(regionId, answer) {
            return getAcceptedAnswers(regionId).some(
                acceptedAnswer => normalizeAnswer(acceptedAnswer) === normalizeAnswer(answer)
            );
        }

        function getAcceptedAnswers(regionId) {
            const region = regionById.get(regionId);
            if (!region) return [regionId];

            return region.answers || [region.name || region.id];
        }

        function getRegionLabel(regionId) {
            const region = regionById.get(regionId);
            return region ? region.name : regionId;
        }

        function getRegionElement(regionId) {
            return state.mapSvg.getElementById(regionId);
        }

        function normalizeAnswer(answer) {
            return String(answer)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "");
        }

        function getOpaqueFill(region) {
            const fill = getComputedStyle(region).fill;
            const rgbaMatch = fill.match(/^rgba\((.+),\s*[\d.]+\)$/);

            if (!rgbaMatch) return fill;
            return `rgb(${rgbaMatch[1]})`;
        }

        function playSound(name) {
            const sound = sounds[name];
            if (!sound) return;

            sound.currentTime = 0;
            sound.play().catch(() => {});
        }

        function showMapError() {
            elements.map.innerHTML = `<p class="map-error">${config.map.errorMessage || "The map could not be loaded."}</p>`;
        }

        function createFeedbackElements() {
            elements.live = document.createElement("div");
            elements.live.className = "sr-only";
            elements.live.setAttribute("aria-live", "polite");
            elements.live.setAttribute("aria-atomic", "true");
            document.body.appendChild(elements.live);

            const overlay = document.createElement("div");
            overlay.className = "game-complete";
            overlay.hidden = true;
            overlay.innerHTML = `
                <div class="game-complete__panel" role="dialog" aria-modal="true" aria-labelledby="game-complete-title" aria-describedby="game-complete-desc">
                    <h2 class="game-complete__title" id="game-complete-title">Map complete!</h2>
                    <p class="game-complete__message" id="game-complete-desc"></p>
                    <p class="game-complete__stats"></p>
                    <button type="button" class="btn game-complete__again">Play again</button>
                </div>`;
            document.body.appendChild(overlay);

            elements.overlay = overlay;
            elements.overlayMessage = overlay.querySelector(".game-complete__message");
            elements.overlayStats = overlay.querySelector(".game-complete__stats");
            elements.overlayButton = overlay.querySelector(".game-complete__again");
            elements.overlayButton.addEventListener("click", resetGame);
        }

        function announce(message) {
            if (elements.live) {
                elements.live.textContent = message;
            }
        }

        function flashInput(className) {
            const input = elements.input;
            input.classList.remove("is-wrong", "is-correct");
            void input.offsetWidth; // restart the animation if one is already running
            input.classList.add(className);

            clearTimeout(state.flashTimer);
            state.flashTimer = setTimeout(() => {
                input.classList.remove("is-wrong", "is-correct");
            }, 600);
        }

        function showCompletion() {
            const message = config.completionMessage || "Congratulations! You've completed the game.";

            if (!elements.overlay) {
                announce(message);
                return;
            }

            const mistakeLabel = state.mistakes === 1 ? "mistake" : "mistakes";
            elements.overlayMessage.textContent = message;
            elements.overlayStats.textContent = `${state.completed} correct · ${state.mistakes} ${mistakeLabel}`;
            elements.overlay.hidden = false;
            elements.overlayButton.focus();
        }

        function hideCompletion() {
            if (elements.overlay) {
                elements.overlay.hidden = true;
            }
        }

        function resetGame() {
            hideCompletion();

            state.completed = 0;
            state.mistakes = 0;
            state.selectedRegionId = null;
            state.remainingRegionIds = new Set();

            state.guessableRegions.forEach(region => {
                state.remainingRegionIds.add(region.id);
                region.classList.remove("completed-state", "selected-state");
                region.style.removeProperty("fill");
                region.style.removeProperty("cursor");
                region.style.removeProperty("transform-origin");
                region.setAttribute("tabindex", "0");
                region.setAttribute("aria-disabled", "false");
            });

            elements.completed.textContent = "0";
            elements.mistakes.textContent = "0";
            elements.input.value = "";
            elements.input.classList.remove("is-wrong", "is-correct");

            selectRandomRegion({ silent: true });
            elements.input.focus();
        }
    }

    window.createCountryGame = createCountryGame;
})();
