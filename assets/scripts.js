gsap.registerPlugin(Draggable, MorphSVGPlugin, SplitText);

async function switchLang() {
	const urlParams = new URLSearchParams(window.location.search);
	let lang = urlParams.get("lang") || localStorage.getItem("lang");

	if (lang === "en") lang = "en-us";

	if (!lang) {
		const browserLang = navigator.language || navigator.languages[0];
		const shortLang = browserLang.split("-")[0];
		const regionLang = browserLang.toLowerCase();
		lang = regionLang.startsWith("es")
			? "es"
			: (["en", "es"].includes(shortLang) ? (shortLang === "en" ? "en-us" : "es") : "en-us");
	}

	localStorage.setItem("lang", lang);
	document.documentElement.setAttribute("lang", lang);

	const db = (await import(`./lang/${lang}.js`)).default;

	function updateUrlLang(newLang) {
		const url = new URL(window.location.href);
		url.searchParams.set("lang", newLang);
		window.location.href = url.toString();
	}

	const sections = [
		{ prefix: "works", wrapper: "#works_container", template: "#works_template" },
		{ prefix: "behind", wrapper: "#behind_container", template: "#behind_template" }
	];

	function fillContent(root, data) {
		if (!root || !data) return;

		let prefix = "";
		if (root instanceof Element) {
			if (root.closest(".show_works")) prefix = "works";
			if (root.closest(".show_behind")) prefix = "behind";
		}

		root.querySelectorAll("[data-content]").forEach(el => {
			const key = el.getAttribute("data-content");
			if (key && data[key] !== undefined) {
				if (el.tagName === "IMG") {
					el.src = data[key];
				} else {
					el.innerHTML = data[key];
				}
			}
		});

		if (prefix) {
			const extraImgWrap = root.querySelector(`.show_${prefix}-img`);
			if (extraImgWrap) {
				extraImgWrap.innerHTML = "";

				let i = 1;
				while (data[`image${i}`]) {
					const imgUrl = data[`image${i}`];
					const caption = data[`image${i}capt`] || "";

					const wrap = document.createElement("figure");

					const img = document.createElement("img");
					img.src = imgUrl;
					if (caption) img.alt = caption;

					wrap.appendChild(img);

					if (caption) {
						const cap = document.createElement("figcaption");
						cap.textContent = caption;
						wrap.appendChild(cap);
					}

					extraImgWrap.appendChild(wrap);
					i++;
				}
			}
		}
	}

	try { if (window.__langPageObserver) { window.__langPageObserver.disconnect(); } } catch (e) { }
	window.langAPI = {
		getData: (key) => (db && db[key]) ? db[key] : null,
		fillContent: (root, data) => { if (root && data) fillContent(root, data); },
		fillNodeByPage: (root) => { if (!root) return; const k = root.getAttribute("data-page"); if (k && db[k]) fillContent(root, db[k]); }
	};
	window.__langPageObserver = new MutationObserver(muts => {
		for (const m of muts) {
			if (m.type === "attributes" && m.attributeName === "data-page") {
				const node = m.target;
				const key = node.getAttribute("data-page");
				if (key && db[key]) {
					fillContent(node, db[key]);
				}
			}
		}
	});
	window.__langPageObserver.observe(document.body, { attributes: true, attributeFilter: ["data-page"], subtree: true });
	document.querySelectorAll(".show_works[data-page], .show_behind[data-page]").forEach(node => {
		const k = node.getAttribute("data-page");
		if (k && db[k]) fillContent(node, db[k]);
	});

	document.querySelectorAll("[data-lang]").forEach(el => {
		const key = el.getAttribute("data-lang");
		if (db.ui[key]) el.innerHTML = db.ui[key];
	});

	sections.forEach(sec => {
		const elWrapper = document.querySelector(sec.wrapper);
		const tpl = document.querySelector(sec.template);

		if (elWrapper && tpl) {
			elWrapper.innerHTML = "";
			Object.entries(db)
				.filter(([key]) => key.startsWith(sec.prefix))
				.forEach(([key, value]) => {
					const clone = tpl.content.cloneNode(true);
					const sect = clone.querySelector("[data-page]");
					if (sect) sect.setAttribute("data-page", key);
					fillContent(clone, value);
					elWrapper.appendChild(clone);
				});
		}
	});

	if (db.about) {
		document.querySelectorAll("[data-page='about']").forEach(node => {
			fillContent(node, db.about);
		});
	}

	const elBtnLang = document.getElementById("navLangBTN");
	if (elBtnLang) {
		elBtnLang.addEventListener("click", () => {
			const newLang = lang === "en-us" ? "es" : "en-us";
			localStorage.setItem("lang", newLang);
			sessionStorage.setItem("langSwitch", "true");
			updateUrlLang(newLang);
		});
	}
}

function decoLink() {
	const containers = document.querySelectorAll('.decoCont');

	containers.forEach(container => {
		const links = container.querySelectorAll('.decoLink');

		links.forEach(el => {
			if (el.querySelector('span[data-hover-layer]')) return;

			const text = el.textContent.trim();
			if (!text) return;

			const hoverLayer = document.createElement('span');
			hoverLayer.setAttribute('data-hover-layer', 'true');
			hoverLayer.textContent = text;

			Object.assign(el.style, {
				position: 'relative',
				display: 'inline-block',
				color: '',
				overflow: 'hidden'
			});

			Object.assign(hoverLayer.style, {
				position: 'absolute',
				width: '100%',
				height: '100%',
				top: '0',
				right: '0',
				bottom: '0',
				left: '0',
				color: 'var(--green)',
				clipPath: 'polygon(0 0, 0 0, 0% 100%, 0 100%)',
				transition: 'clip-path 0.25s ease-in-out',
				pointerEvents: 'none'
			});

			el.appendChild(hoverLayer);

			el.addEventListener('mouseenter', () => {
				hoverLayer.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
			});

			el.addEventListener('mouseleave', () => {
				hoverLayer.style.clipPath = 'polygon(0 0, 0 0, 0% 100%, 0 100%)';
			});
		});

		const image = container.querySelector('.decoIMG');
		if (image) {
			image.addEventListener('mouseenter', () => {
				container.querySelectorAll('.decoLink [data-hover-layer]').forEach(hoverLayer => {
					hoverLayer.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
				});
			});

			image.addEventListener('mouseleave', () => {
				container.querySelectorAll('.decoLink [data-hover-layer]').forEach(hoverLayer => {
					hoverLayer.style.clipPath = 'polygon(0 0, 0 0, 0% 100%, 0 100%)';
				});
			});
		}
	});
}

let currentSection = null, sectionMap = {}, switchSection = null, pendingTargetSection = null, menuIconTl = null, activeContent = null;
async function initMenu() {
	const menuInner = document.querySelector(".nav_items");
	const menuBTN = document.querySelector(".nav_button");
	const backEvent = document.querySelector(".show_works-wrapper, .show_behind-wrapper");

	// --- MENU ICON ANIMATION ---
	menuIconTl = gsap.timeline({ paused: true, reversed: true })
		.to("#rightUp", { morphSVG: "#rightUpE", ease: "elastic.out(1.25,0.75)" })
		.to("#rightDown", { morphSVG: "#rightDownE", ease: "elastic.out(1.25,0.75)" }, 0)
		.to("#leftUp", { morphSVG: "#leftUpE", ease: "elastic.out(1.25,0.75)" }, 0)
		.to("#leftDown", { morphSVG: "#leftDownE", ease: "elastic.out(1.25,0.75)" }, 0);

	// --- PORTRAIT MENU TIMELINE ---
	let menuTl = null;
	if (window.matchMedia("(orientation: portrait) and (max-width: 767px)").matches) {
		menuTl = gsap.timeline({ paused: true, reversed: true })
			.set(menuInner, { display: "flex" })
			.to(menuInner, { width: "100vw", ease: "elastic.out(1.75,0.5)" })
			.fromTo(".nav_items ul li",
				{ x: 200, opacity: 0 },
				{ x: 0, opacity: 1, duration: 0.2, stagger: 0.1 },
				"<0.3"
			);
	}

	// --- TO TOP CLICK ---
	document.querySelectorAll("[data-lang^='contentTop']").forEach(top => {
		top.addEventListener("click", () => {
			if (backEvent) {
				backEvent.scrollTo({ top: 0, left: 0, behavior: "smooth" });
			}
			if (document.querySelector(".main__section-about")) {
				document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
			}
		});
	});

	// --- MENU BUTTON HANDLER ---
	menuBTN.addEventListener("click", () => {
		if (activeContent && activeContent.__tl) {
			backEvent.scrollTo({ top: 0, left: 0, behavior: "smooth" });
			activeContent.__tl.reverse();
			return;
		}

		if (menuIconTl.isActive() || (menuTl && menuTl.isActive())) return;

		if (menuIconTl.reversed()) {
			menuIconTl.play();
		} else {
			menuIconTl.reverse();
		}

		if (menuTl) {
			menuTl.reversed() ? menuTl.play() : menuTl.reverse();
		}
	});

	// --- HELPER ---
	function waitForMenuClose() {
		return new Promise(resolve => {
			if (!menuTl || menuTl.reversed()) {
				resolve();
				return;
			}
			menuTl.eventCallback("onReverseComplete", () => {
				menuTl.eventCallback("onReverseComplete", null);
				resolve();
			});
			if (!menuTl.reversed()) {
				menuIconTl.reverse();
				menuTl.reverse();
			}
		});
	}

	// --- COMMON MENU LINKS ---
	const links = document.querySelectorAll("[data-lang^='menu_']");
	links.forEach(link => {
		link.addEventListener("click", async function () {
			const langKey = link.getAttribute("data-lang");
			const selector = sectionMap[langKey];
			const targetSection = document.querySelector(selector);

			if (!selector || !targetSection || targetSection === currentSection) return;

			if (langKey === "menu_home") {
				setActiveDeco(null);
			} else {
				setActiveDeco(link);
			}

			if (window.matchMedia('(orientation: portrait) and (max-width: 767px)').matches) {
				pendingTargetSection = targetSection;
				await waitForMenuClose();
				if (pendingTargetSection) {
					switchSection(pendingTargetSection);
					pendingTargetSection = null;
				}
			} else {
				switchSection(targetSection);
			}
		});
	});

	// --- LOGO CLICK HANDLER ---
	document.querySelectorAll(".header_logo a").forEach(logo => {
		logo.addEventListener("click", async e => {
			e.preventDefault();
			backEvent.scrollTo({ top: 0, left: 0, behavior: "smooth" });

			const selector = sectionMap["menu_home"];
			const targetSection = document.querySelector(selector);
			if (!selector || !targetSection || targetSection === currentSection) return;

			setActiveDeco(null);

			function waitForFullClose(container) {
				return new Promise(resolve => {
					if (!container?.__tl) return resolve();
					container.__tl.reverse();
					function check() {
						if (!container.__tl || (container.__tl.reversed() && !container.__tl.isActive())) {
							requestAnimationFrame(() => resolve());
						} else {
							requestAnimationFrame(check);
						}
					}
					check();
				});
			}

			async function goHomeAfterContentClose(targetSection) {
				if (activeContent && activeContent.__tl) {
					const backEvent = activeContent.querySelector(".show_works-wrapper, .show_behind-wrapper");
					if (backEvent) {
						backEvent.scrollTo({ top: 0, left: 0, behavior: "smooth" });
					}
					await waitForFullClose(activeContent);
					switchSection(targetSection);
				} else {
					switchSection(targetSection);
				}
			}

			if (window.matchMedia('(orientation: portrait) and (max-width: 767px)').matches) {
				pendingTargetSection = targetSection;
				await waitForMenuClose();
				if (pendingTargetSection) {
					await goHomeAfterContentClose(targetSection);
					pendingTargetSection = null;
				}
			} else {
				await goHomeAfterContentClose(targetSection);
			}
		});
	});

	function setActiveDeco(activeLink) {
		document.querySelectorAll('.decoLink').forEach(link => {
			link.style.color = '';
		});

		if (activeLink) {
			activeLink.style.color = 'var(--green)';
		}
	}
}

async function introAnimation() {
	const homeSection = document.querySelector(".main__section-home");
	if (!homeSection) return;

	const sectionUpper = homeSection.querySelector(".section_upper");
	const header = document.querySelector("header");
	const nav = document.querySelector("nav");

	gsap.set(header, { xPercent: -100 });
	gsap.set(nav, { xPercent: 100 });
	gsap.set(sectionUpper, { height: "100dvh" });
	gsap.set(".home_content span span", { display: "none", y: 100, autoAlpha: 0 });

	const span = sectionUpper.querySelector("div span");
	let splittedIn = null;
	if (span) {
		if (span._splitText) span._splitText.revert();
		splittedIn = new SplitText(span, { type: "words, chars" });
		span._splitText = splittedIn;
		gsap.set(splittedIn.chars, { autoAlpha: 0, scaleY: 0, transformOrigin: "center bottom" });
	}

	const tl = gsap.timeline();
	tl.to(sectionUpper, { height: "50dvh", duration: 0.6, ease: "power2.out" }, 2)
		.to(header, { xPercent: 0, duration: 0.6, ease: "power3.out" }, 2)
		.to(nav, { xPercent: 0, duration: 0.6, ease: "power3.out" }, 2)
		.to(splittedIn?.chars || [], {
			autoAlpha: 1,
			scaleY: 1,
			stagger: { each: 0.025, from: "random" },
			ease: "power4.out",
			duration: 0.6
		}, "-=0.2")
		.to(".home_content span span", { display: "flex", duration: 0 }, "-=0.4")
		.to(".home_content span span", {
			y: 0,
			autoAlpha: 1,
			duration: 0.25,
			stagger: { each: 0.05, from: "start" },
			ease: "power3.out"
		}, "-=0.3");

	return tl;
}

async function switchMain() {
	await document.fonts.ready;

	currentSection = document.querySelector(".main__section-home");
	if (currentSection) currentSection.style.display = "flex";

	sectionMap = {
		menu_home: ".main__section-home",
		menu_works: ".main__section-works",
		menu_behind: ".main__section-behind",
		menu_about: ".main__section-about",
	};

	const splitCache = {};
	Object.values(sectionMap).forEach((selector) => {
		const section = document.querySelector(selector);
		const span = section?.querySelector(".section_upper div span");
		if (span) splitCache[selector] = new SplitText(span, { type: "words, chars" });
	});

	const navEntries = performance.getEntriesByType("navigation");
	const navType = navEntries[0]?.type || "navigate";

	const isReload = navType === "reload";
	const isNavigate = navType === "navigate";

	const langSwitch = sessionStorage.getItem("langSwitch") === "true";

	if (isReload || isNavigate || langSwitch) {
		await introAnimation();
		sessionStorage.removeItem("langSwitch");
	}


	switchSection = async function (targetSection) {
		if (!targetSection || targetSection === currentSection) return;

		const mainActual = currentSection;
		const mainNext = targetSection;

		// --- SCROLL SET ---
		if (mainActual?.classList.contains("main__section-about")) {
			document.body.style.overflowY = "hidden";
		}
		if (mainNext?.classList.contains("main__section-about")) {
			document.body.style.overflowY = "auto";
		}

		// --- SPLITTEXT CACHE REFRESH ---
		const selectorOut = Object.values(sectionMap).find(sel => document.querySelector(sel) === mainActual);
		const selectorIn = Object.values(sectionMap).find(sel => document.querySelector(sel) === mainNext);

		let splittedOut = selectorOut ? splitCache[selectorOut] : null;
		if (splittedOut) {
			splittedOut.revert();
			splittedOut = new SplitText(mainActual.querySelector(".section_upper div span"), { type: "words, chars" });
			splitCache[selectorOut] = splittedOut;
		}
		let splittedIn = selectorIn ? splitCache[selectorIn] : null;
		if (splittedIn) {
			splittedIn.revert();
			splittedIn = new SplitText(mainNext.querySelector(".section_upper div span"), { type: "words, chars" });
			splitCache[selectorIn] = splittedIn;
		}

		// --- OUT ANIMATIONS ---
		const outPrefix = mainActual.classList.contains("main__section-works") ? "works" : mainActual.classList.contains("main__section-behind") ? "behind" : null;
		if (outPrefix && sliderInstances[outPrefix]) {
			await sliderInstances[outPrefix].slideOut();
		}
		if (splittedOut?.chars?.length) {
			await new Promise(r => gsap.to(splittedOut.chars, {
				scaleY: 0,
				transformOrigin: "center bottom",
				stagger: { each: 0.025, from: "random" },
				ease: "power4.in",
				onComplete: r
			}));
		}

		await gsap.to(mainActual.querySelector(".section_upper"), { height: "100dvh", duration: 0.35, ease: "power2.in" });
		if (mainActual.classList.contains("main__section-about")) {
			gsap.set(document.querySelector(".show_about-wrapper"), { clearProps: "opacity,visibility" });
		}
		if (mainNext.classList.contains("main__section-home")) {
			gsap.set(document.querySelectorAll(".home_content span span"), { clearProps: "all" });
			gsap.to(".home_content", { display: "", duration: 0 });
		}
		mainActual.style.display = "none";


		// --- IN ANIMATIONS ---
		if (mainNext.classList.contains("main__section-home")) {
			gsap.set(".home_content span span", { y: 100, autoAlpha: 0 });
		}
		if (splittedIn?.chars?.length) {
			gsap.set(splittedIn.chars, { scaleY: 0, transformOrigin: "center bottom", duration: 0 });
		}
		mainNext.style.display = "flex";
		mainNext.style.removeProperty("visibility");
		mainNext.style.removeProperty("opacity");

		const wrappers = document.querySelectorAll(".swiper-wrapper, .swiper-slide");
		wrappers.forEach(w => gsap.set(w, { clearProps: "opacity,visibility" }));

		if (mainNext.classList.contains("main__section-home")) {
			await gsap.fromTo(mainNext.querySelector(".section_upper"),
				{ height: "100dvh" },
				{ height: "50dvh", duration: 0.25, ease: "power2.out" }
			);
		} else {
			const targetHeight = window.matchMedia("(orientation: portrait)").matches ? "20dvh" : "30dvh";
			await gsap.fromTo(mainNext.querySelector(".section_upper"),
				{ height: "100dvh" },
				{ height: targetHeight, duration: 0.25, ease: "power2.out" }
			);
		}

		if (splittedIn?.chars?.length) {
			await new Promise(r => gsap.to(splittedIn.chars, {
				scaleY: 1,
				transformOrigin: "center bottom",
				stagger: { each: 0.025, from: "random" },
				ease: "power4.out",
				onComplete: r
			}));
		}

		if (mainNext.classList.contains("main__section-home")) {
			gsap.to(".home_content", { display: "flex", duration: 0 });
			gsap.to(".home_content span span", { y: 0, autoAlpha: 1, duration: 0.25, stagger: { each: 0.05, from: "start" } })
		}

		if (mainNext.classList.contains("main__section-about")) {
			gsap.fromTo(".show_about-wrapper", { y: 100, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: "power4.out" })
		}

		const inPrefix = mainNext.classList.contains("main__section-works") ? "works" : mainNext.classList.contains("main__section-behind") ? "behind" : null;
		if (inPrefix) {
			const api = sliderInstances[inPrefix] || initSlider(inPrefix);
			if (api) {
				api.refresh();
				await api.slideIn();
			}
		}

		currentSection = mainNext;
	};

	window.addEventListener("resize", () => {
		const active =
			currentSection?.classList.contains("main__section-works") ? "works" :
				currentSection?.classList.contains("main__section-behind") ? "behind" : null;
		if (active && sliderInstances[active]) sliderInstances[active].refresh();
	});
}

const sliderInstances = {};
function initSlider(prefix) {
	const root = document.querySelector(`.swiper-${prefix}`);
	const track = document.querySelector(`#${prefix}_container`);
	if (!root || !track) return null;

	const slides = Array.from(track.children).reverse();

	const originalSlides = slides.map((el, idx) => ({
		el,
		originIndex: idx,
	}));
	if (!originalSlides.length) return null;

	track.innerHTML = "";
	slides.forEach(el => track.appendChild(el));

	track.addEventListener("click", (e) => {
		const slide = e.target.closest("[data-page]");
		if (slide && track.contains(slide)) {
			showContent(slide);
		}
	});

	Object.assign(root.style, { overflow: "hidden", position: "relative" });
	Object.assign(track.style, { display: "flex", willChange: "transform" });

	let perView = 1, slideWidth = 0, gapPx = 0;
	let currentIndex = 0;
	let lastDirection = null;
	let drag = null;

	const getPerView = () => {
		const w = window.innerWidth;
		if (w >= 1920) return 7;
		if (w >= 1280) return 5;
		if (w >= 768) return 3;
		return 1;
	};
	const readGapPx = () => {
		const cs = getComputedStyle(track);
		return parseFloat(cs.columnGap || cs.gap || "0") || 0;
	};
	const unit = () => slideWidth + gapPx;

	function applyLayout() {
		perView = getPerView();
		gapPx = readGapPx();

		const rootW = root.clientWidth || window.innerWidth;
		const totalGaps = Math.max(0, perView - 1) * gapPx;
		slideWidth = (rootW - totalGaps) / perView;

		Array.from(track.children).forEach(slide => {
			slide.style.flex = `0 0 ${slideWidth}px`;
			slide.style.width = `${slideWidth}px`;
		});

		setImmediatePosition(currentIndex);
		updateActiveSlides();
	}

	function setImmediatePosition(i) {
		currentIndex = i;
		gsap.set(track, { x: -((i + originalSlides.length) * unit()) });
	}

	function setupClones() {
		const before = originalSlides.map(s => {
			const c = s.el.cloneNode(true);
			c.classList.add("clone");
			return c;
		});
		const after = originalSlides.map(s => {
			const c = s.el.cloneNode(true);
			c.classList.add("clone");
			return c;
		});
		before.reverse().forEach(c => track.insertBefore(c, track.firstChild));
		after.forEach(c => track.appendChild(c));
	}

	function updateActiveSlides() {
		const allSlides = Array.from(track.children);
		allSlides.forEach(el => el.classList.remove("active"));

		const offset = originalSlides.length + currentIndex;
		for (let i = 0; i < perView; i++) {
			const s = allSlides[offset + i];
			if (s) s.classList.add("active");
		}
	}

	function normalizeIndex() {
		const N = originalSlides.length;

		if (lastDirection === "next" && currentIndex >= N) {
			currentIndex -= N;
			setImmediatePosition(currentIndex);
		}
		if (lastDirection === "prev" && currentIndex < 0) {
			currentIndex += N;
			setImmediatePosition(currentIndex);
		}
		updateActiveSlides();
	}

	function goTo(index, opts = {}, direction = null) {
		if (direction) lastDirection = direction;
		currentIndex = index;

		return gsap.to(track, {
			x: -((index + originalSlides.length) * unit()),
			duration: opts.duration ?? 0.5,
			ease: opts.ease ?? "power3.inOut",
			overwrite: true,
			onUpdate: updateActiveSlides,
			onComplete: normalizeIndex
		});
	}
	function next() { return goTo(currentIndex + 1, {}, "next"); }
	function prev() { return goTo(currentIndex - 1, {}, "prev"); }

	function createDraggable() {
		if (drag) drag.kill();
		drag = Draggable.create(track, {
			type: "x", inertia: true,
			onDragStart: () => gsap.killTweensOf(track),
			onDragEnd: function () {
				const raw = -this.endX / unit();
				const offset = originalSlides.length + currentIndex;
				const diff = raw - offset;
				const dir = diff > 0 ? "next" : "prev";
				const idx = currentIndex + (dir === "next" ? 1 : -1);
				goTo(idx, { duration: 0.45, ease: "power3.out" }, dir);
			}
		})[0];
	}

	let wheelLocked = false;
	function onWheel(e) {
		if (!root.contains(e.target)) return;
		e.preventDefault();
		if (wheelLocked) return;
		wheelLocked = true;
		(e.deltaY > 0 || e.deltaX > 0) ? next() : prev();
		setTimeout(() => { wheelLocked = false; }, 400);
	}

	function onKey(e) {
		if (e.key === "ArrowRight") next();
		if (e.key === "ArrowLeft") prev();
	}

	function onResize() {
		applyLayout();
	}

	setupClones();
	createDraggable();
	applyLayout();
	setImmediatePosition(0);
	updateActiveSlides();

	document.addEventListener("keydown", onKey);
	window.addEventListener("resize", onResize, { passive: true });
	window.addEventListener("wheel", onWheel, { passive: false });

	function slideIn() {
		return new Promise(resolve => {
			goTo(0, { duration: 0 });

			const allSlides = Array.from(track.children);
			const actives = track.querySelectorAll(".active");
			if (!actives.length) return resolve();

			gsap.set(allSlides, { autoAlpha: 1 });

			gsap.fromTo(actives, {
				xPercent: 120,
				autoAlpha: 0
			}, {
				xPercent: 0,
				autoAlpha: 1,
				stagger: 0.08,
				duration: 0.55,
				ease: "power4.out",
				onComplete: () => resolve(),
			});
		});
	}

	function slideOut() {
		return new Promise(resolve => {
			const actives = track.querySelectorAll(".active");
			if (!actives.length) return resolve();

			Array.from(track.children).forEach(s => {
				if (!s.classList.contains("active")) gsap.set(s, { autoAlpha: 0 });
			});

			gsap.fromTo(actives, {
				xPercent: 0,
				autoAlpha: 1
			}, {
				xPercent: -120,
				autoAlpha: 0,
				stagger: 0.06,
				duration: 0.45,
				ease: "power3.in",
				onComplete: () => {
					gsap.killTweensOf(track);
					gsap.set(track, { autoAlpha: 0 });
					resolve();
				}
			});
		});
	}

	const api = {
		prefix, root, track,
		get slides() { return Array.from(track.children); },
		get perView() { return perView; },
		get slideWidth() { return slideWidth; },
		get index() {
			const N = originalSlides.length;
			return ((currentIndex % N) + N) % N;
		},
		goTo, next, prev,
		refresh: onResize,
		slideIn, slideOut,
		destroy() {
			document.removeEventListener("keydown", onKey);
			window.removeEventListener("resize", onResize);
			window.removeEventListener("wheel", onWheel);
			if (drag) drag.kill();
			gsap.set(track, { clearProps: "transform,opacity,visibility" });
			Array.from(track.children).forEach(s => s.style.removeProperty("width"));
		}
	};

	sliderInstances[prefix] = api;
	return api;
}

let contentTl = null;
async function showContent(triggerEl) {
	const slide = triggerEl?.closest?.("[data-page]") || triggerEl;
	if (!slide) return;

	const pageKey = slide.getAttribute("data-page");
	if (!pageKey) return;

	let prefix = "";
	let container = null;
	if (pageKey.startsWith("works")) {
		prefix = "works";
		container = document.querySelector(".show_works");
	} else if (pageKey.startsWith("behind")) {
		prefix = "behind";
		container = document.querySelector(".show_behind");
	} else {
		return;
	}
	if (!container) return;

	if (container.__tl && container.__tl.isActive() && !container.__tl.reversed()) return;

	container.setAttribute("data-page", pageKey);
	if (window.langAPI?.getData && window.langAPI?.fillContent) {
		const obj = window.langAPI.getData(pageKey);
		if (obj) window.langAPI.fillContent(container, obj);
	}

	function startSvgStrokeWatcher() {
		const btn = document.querySelector(".nav_button");
		const svg = btn?.querySelector("svg");
		if (!btn || !svg) return { stop() { } };

		const w = 50, h = 50;
		const canvas = document.createElement("canvas");
		canvas.width = w; canvas.height = h;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });

		const LOW = 120;
		const HIGH = 150;
		let running = true;
		let lastTs = 0;
		let decided = false;
		let current = null;

		const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

		function parseRGBA(str) {
			if (!str) return null;
			if (str.startsWith("rgb")) {
				const nums = str.match(/[\d.]+/g)?.map(Number);
				if (!nums) return null;
				const [r, g, b, a = 1] = nums;
				return { r, g, b, a };
			}
			if (str.startsWith("#")) {
				let hex = str.slice(1);
				if (hex.length === 3) hex = hex.split("").map(ch => ch + ch).join("");
				if (hex.length === 6) {
					const r = parseInt(hex.slice(0, 2), 16);
					const g = parseInt(hex.slice(2, 4), 16);
					const b = parseInt(hex.slice(4, 6), 16);
					return { r, g, b, a: 1 };
				}
			}
			if (str === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
			return null;
		}

		function sampleAvgLumaFromImg(img, sampleRect) {
			const rect = img.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0 || img.naturalWidth === 0) return null;

			const scaleX = img.naturalWidth / rect.width;
			const scaleY = img.naturalHeight / rect.height;

			const vx1 = Math.max(sampleRect.left, rect.left);
			const vy1 = Math.max(sampleRect.top, rect.top);
			const vx2 = Math.min(sampleRect.right, rect.right);
			const vy2 = Math.min(sampleRect.bottom, rect.bottom);
			if (vx2 <= vx1 || vy2 <= vy1) return null;

			const sx = (vx1 - rect.left) * scaleX;
			const sy = (vy1 - rect.top) * scaleY;
			const sw = (vx2 - vx1) * scaleX;
			const sh = (vy2 - vy1) * scaleY;

			try {
				ctx.clearRect(0, 0, w, h);
				ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
				const data = ctx.getImageData(0, 0, w, h).data;
				let sum = 0;
				for (let i = 0; i < data.length; i += 4) sum += lum(data[i], data[i + 1], data[i + 2]);
				return sum / (w * h);
			} catch {
				return null;
			}
		}

		const isUnderBtn = (el) => el && (el === btn || btn.contains(el));
		const isInvisible = (el) => {
			const cs = getComputedStyle(el);
			return cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05;
		};

		function pickAvgLuma() {
			const sample = {
				left: window.innerWidth - w,
				top: 0,
				right: window.innerWidth,
				bottom: h,
				cx: window.innerWidth - w / 2,
				cy: h / 2
			};

			const prevPE = btn.style.pointerEvents;
			btn.style.pointerEvents = "none";
			const stack = document.elementsFromPoint(sample.cx, sample.cy) || [];
			btn.style.pointerEvents = prevPE;

			for (const el of stack) {
				if (isUnderBtn(el) || el.tagName === "SVG" || el.tagName === "PATH" || isInvisible(el)) continue;

				if (el.tagName === "IMG" && el.complete) {
					const avg = sampleAvgLumaFromImg(el, sample);
					if (avg != null) return avg;
				}

				const bg = getComputedStyle(el).backgroundColor;
				const rgba = parseRGBA(bg);
				if (rgba && rgba.a > 0) {
					return lum(rgba.r, rgba.g, rgba.b);
				}

			}

			const bodyRGBA = parseRGBA(getComputedStyle(document.body).backgroundColor);
			if (bodyRGBA && bodyRGBA.a > 0) return lum(bodyRGBA.r, bodyRGBA.g, bodyRGBA.b);

			return null;
		}

		function applyDecision(avg) {
			if (avg == null) return;
			if (!decided) {
				current = (avg > 135) ? "black" : "white";
				svg.style.stroke = current;
				decided = true;
				return;
			}
			if (current === "white" && avg > HIGH) {
				current = "black";
				svg.style.stroke = "black";
			} else if (current === "black" && avg < LOW) {
				current = "white";
				svg.style.stroke = "white";
			}
		}

		function loop(ts) {
			if (!running) return;
			if (ts - lastTs < 70) { requestAnimationFrame(loop); return; }
			lastTs = ts;

			const avg = pickAvgLuma();
			applyDecision(avg);

			requestAnimationFrame(loop);
		}

		requestAnimationFrame(loop);
		return { stop() { running = false; } };
	}

	const rect = slide.getBoundingClientRect();
	const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	const fly = slide.cloneNode(true);
	fly.classList.add("fly-clone");
	Object.assign(fly.style, {
		position: "fixed",
		left: rect.left + "px",
		top: rect.top + "px",
		width: rect.width + "px",
		height: rect.height + "px",
		zIndex: 99999,
		margin: 0,
		pointerEvents: "none",
		transform: "translateZ(0)"
	});

	fly.querySelectorAll("img").forEach(img => {
		img.style.width = "100%";
		img.style.height = "100%";
		img.style.objectFit = "cover";
		img.style.filter = "none";
	});

	document.body.appendChild(fly);

	const backEvent = container.querySelector(".show_works-wrapper, .show_behind-wrapper");
	const handleEsc = (e) => {
		if (e.key === "Escape") {
			backEvent.scrollTo({ top: 0, left: 0, behavior: "smooth" });
			container.__tl?.reverse();
		}
	};

	const flyImages = fly.querySelectorAll("img");
	const firstImg = flyImages[0];
	const aspectRatio = firstImg.naturalHeight / firstImg.naturalWidth;
	const calculatedHeight = vw * aspectRatio;

	// --- MASTER ---
	const tl = gsap.timeline({
		defaults: { ease: "power3.inOut" },
		onStart: () => {
			activeContent = container;

			if (menuIconTl.reversed()) menuIconTl.play();

			container.__strokeWatcher = startSvgStrokeWatcher();

			container.style.display = "flex";
			container.style.pointerEvents = "auto";
			container.querySelector(".show_works-upper div span, .show_behind-upper div span").style.display = "none";
			gsap.set(container, { autoAlpha: 0 });
			document.addEventListener("keydown", handleEsc);
		},
		onReverseComplete: () => {
			try { fly.remove(); } catch (e) { }
			activeContent = null;

			if (!menuIconTl.reversed()) menuIconTl.reverse();

			if (container.__strokeWatcher) {
				container.__strokeWatcher.stop();
				container.__strokeWatcher = null;
			}

			container.style.display = "none";
			container.style.pointerEvents = "none";
			gsap.set(container, { clearProps: "all" });
			document.removeEventListener("keydown", handleEsc);
		}
	});

	// --- ANIMATIONS ---
	tl.to(fly.querySelector(".works_heading, .behind_heading"), { xPercent: 1000, duration: 0.25, ease: "power2.in" });
	tl.to(fly.querySelector(".works_details, .behind_details"), { xPercent: -1000, duration: 0.25, ease: "power2.in" }, "<");
	if (window.matchMedia("(orientation: portrait) and (max-width: 767px)").matches) {
		tl.to(".nav_button", { autoAlpha: 1, xPercent: 0, duration: 0 }, "0.1");
	} else {
		tl.to(".nav_items ul li", { autoAlpha: 0, xPercent: 500, duration: 0.35, ease: "power4.in", stagger: { each: 0.1, start: "end" } }, "0.1");
		tl.to(".nav_button", { autoAlpha: 1, xPercent: 0, ease: "elastic.out(1.35,0.4)" });
	}
	tl.to(fly, { autoAlpha: 1, width: vw, height: "100dvh", top: 0, left: 0, ease: "elastic.out(1.75,0.9)" }, "0.4");
	tl.to(container, { autoAlpha: 1, duration: 0 });
	tl.to(fly, { top: window.matchMedia("(orientation: portrait)").matches ? "20vh" : "30vh", height: calculatedHeight, duration: 0.35, ease: "power4.inOut" });

	const titleEl = container.querySelector(".show_works-upper div span, .show_behind-upper div span");
	gsap.delayedCall(0, () => {
		const titleSplit = new SplitText(titleEl, { type: "chars" });
		tl.set(".show_works-upper div span, .show_behind-upper div span", { display: "inline" });
		tl.set(titleSplit.chars, { scaleY: 0, transformOrigin: "center bottom" });
		tl.to(titleSplit.chars, { scaleY: 1, transformOrigin: "center bottom", stagger: { each: 0.025, from: "random" }, ease: "power2.out" });
	});

	tl.to(fly, 0.25, { autoAlpha: 0 });

	container.__tl = tl;
}

async function initGlobal() {
	await switchLang();
	await switchMain();
	decoLink();
	initMenu();
}
initGlobal();
