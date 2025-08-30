gsap.registerPlugin(ScrollTrigger, Draggable, MorphSVGPlugin, SplitText);

async function switchLang() {
	const urlParams = new URLSearchParams(window.location.search);
	let lang = urlParams.get("lang") || localStorage.getItem("lang");

	if (!lang) {
		const browserLang = navigator.language || navigator.languages[0];
		const shortLang = browserLang.split("-")[0];
		const regionLang = browserLang;
		lang = regionLang.startsWith("es") ? "es" : (["en", "es"].includes(shortLang) ? shortLang : "en");
	}
	localStorage.setItem("lang", lang);

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

					const wrap = document.createElement("div");
					wrap.className = "extraImgWrap";

					const img = document.createElement("img");
					img.src = imgUrl;
					if (caption) img.alt = caption;

					wrap.appendChild(img);

					if (caption) {
						const cap = document.createElement("p");
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
			const newLang = lang === "en" ? "es" : "en";
			localStorage.setItem("lang", newLang);
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
				left: '0',
				bottom: '0',
				color: 'var(--black)',
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

async function switchMain() {
	await document.fonts.ready;

	const menuInner = document.querySelector(".nav_items");
	const menuBTN = document.querySelector(".menu_button");

	let currentSection = document.querySelector(".main__section-home");
	if (currentSection) currentSection.style.display = "flex";

	const sectionMap = {
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

	let menuIconTl = null, menuTl = null, pendingTargetSection = null;

	// --- PORTRAIT MENU ANIMATION ---
	if (window.matchMedia("(orientation: portrait) and (max-width: 767px)").matches) {
		menuIconTl = gsap.timeline({ paused: true, reversed: true })
			.to(".rightUp-line", { morphSVG: ".rightUpE", duration: 0.25, ease: "menuIcon" }, 0)
			.to(".rightDown-line", { morphSVG: ".rightDownE", duration: 0.25, ease: "menuIcon" }, 0)
			.to(".leftUp", { morphSVG: ".leftUpE", duration: 0.25, ease: "menuIcon" }, 0)
			.to(".leftDown", { morphSVG: ".leftDownE", duration: 0.25, ease: "menuIcon" }, 0);

		menuTl = gsap.timeline({
			paused: true,
			reversed: true,
			onReverseComplete: () => {
				if (pendingTargetSection && pendingTargetSection !== currentSection) {
					switchSection(pendingTargetSection);
				}
			}
		})
			.set(menuInner, { display: "flex" })
			.to(menuInner, { width: "100vw", ease: "elastic.out(1,0.1)" })
			.fromTo(".nav_items ul li",
				{ x: 200, opacity: 0 },
				{ x: 0, opacity: 1, duration: 0.2, stagger: 0.1 },
				"<0.3"
			);

		menuBTN.addEventListener("click", () => {
			if (menuIconTl.isActive() || menuTl.isActive()) return;
			menuIconTl.reversed() ? menuIconTl.play() : menuIconTl.reverse();
			menuTl.reversed() ? menuTl.play() : menuTl.reverse();
		});
	}

	async function switchSection(targetSection) {
		if (!targetSection || targetSection === currentSection) return;

		const mainActual = currentSection;
		const mainNext = targetSection;

		const selectorOut = Object.values(sectionMap).find(sel => document.querySelector(sel) === mainActual);
		const selectorIn = Object.values(sectionMap).find(sel => document.querySelector(sel) === mainNext);

		if (mainActual?.classList.contains("main__section-about")) {
			document.body.style.overflowY = "hidden";
		}
		if (mainNext?.classList.contains("main__section-about")) {
			document.body.style.overflowY = "auto";
		}

		// --- SPLITTEXT CACHE REFRESH ---
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
		// --- SLIDER OUT ---
		const outPrefix = mainActual.classList.contains("main__section-works") ? "works" : mainActual.classList.contains("main__section-behind") ? "behind" : null;
		if (outPrefix && sliderInstances[outPrefix]) {
			await sliderInstances[outPrefix].slideOut();
		}

		// --- SPLITTED OUT ---
		if (splittedOut?.chars?.length) {
			await new Promise(r => gsap.to(splittedOut.chars, {
				scaleY: 0,
				transformOrigin: "center bottom",
				stagger: { each: 0.025, from: "random" },
				ease: "power4.in",
				onComplete: r
			}));
		}

		// --- MAIN OUT ---
		await gsap.to(mainActual.querySelector(".section_upper"), { height: "100dvh", duration: 0.35, ease: "power2.in" });

		const aboutOUT = mainActual.classList.contains("main__section-about") ? "about" : null;
		if (aboutOUT) {
			gsap.set(document.querySelectorAll(".about_section div"), { clearProps: "opacity,visibility" });
		}

		mainActual.style.display = "none";


		// --- IN ANIMATIONS ---
		if (splittedIn?.chars?.length) {
			gsap.set(splittedIn.chars, { scaleY: 0, transformOrigin: "center bottom" });
		}

		// --- MAIN IN ---
		mainNext.style.display = "flex";
		mainNext.style.removeProperty("visibility");
		mainNext.style.removeProperty("opacity");

		const wrappers = document.querySelectorAll(".swiper-wrapper, .swiper-slide");
		wrappers.forEach(w => gsap.set(w, { clearProps: "opacity,visibility" }));

		const homeIN = mainNext.classList.contains("main__section-home");
		const otherIN = mainNext.classList.contains("main__section-works") || mainNext.classList.contains("main__section-behind") || mainNext.classList.contains("main__section-about");

		if (homeIN) {
			await gsap.fromTo(mainNext.querySelector(".section_upper"),
				{ height: "100dvh" },
				{ height: "0vh", duration: 0.5, ease: "power2.out" }
			);
		}
		if (otherIN) {
			if (window.matchMedia("(orientation: portrait)").matches) {
				await gsap.fromTo(mainNext.querySelector(".section_upper"),
					{ height: "100dvh" },
					{ height: "20dvh", duration: 0.25, ease: "power2.out" }
				);
			} else {
				await gsap.fromTo(mainNext.querySelector(".section_upper"),
					{ height: "100dvh" },
					{ height: "30dvh", duration: 0.25, ease: "power2.out" }
				);
			}
		}

		// --- SPLITTED IN ---
		if (splittedIn?.chars?.length) {
			await new Promise(r => gsap.to(splittedIn.chars, {
				scaleY: 1,
				transformOrigin: "center bottom",
				stagger: { each: 0.025, from: "random" },
				ease: "power4.out",
				onComplete: r
			}));
		}

		const aboutIN = mainNext.classList.contains("main__section-about") ? "about" : null;
		if (aboutIN) {
			aboutContent();
		}

		// --- SLIDER IN ---
		const inPrefix = mainNext.classList.contains("main__section-works") ? "works" : mainNext.classList.contains("main__section-behind") ? "behind" : null;
		if (inPrefix) {
			const api = sliderInstances[inPrefix] || initSlider(inPrefix);
			if (api) {
				api.refresh();
				await api.slideIn();
			}
		}

		currentSection = mainNext;
		pendingTargetSection = null;
	}

	function setActiveDeco(activeLink) {
		document.querySelectorAll('.decoLink').forEach(link => {
			link.style.color = '';
		});

		if (activeLink) {
			activeLink.style.color = 'var(--black)';
		}
	}

	// --- COMMON MENU LINKS ---
	const links = document.querySelectorAll("[data-lang^='menu_']");
	links.forEach(link => {
		link.addEventListener("click", function () {
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
				menuBTN.click();
			} else {
				switchSection(targetSection);
			}
		});
	});

	// --- LOGO CLICK HANDLER ---
	document.querySelectorAll(".header_logo a").forEach(logo => {
		logo.addEventListener("click", e => {
			e.preventDefault();
			const selector = sectionMap["menu_home"];
			const targetSection = document.querySelector(selector);

			if (!selector || !targetSection || targetSection === currentSection) return;

			setActiveDeco(null);

			switchSection(targetSection);

		});
	});

	window.addEventListener("resize", () => {
		const active =
			currentSection?.classList.contains("main__section-works") ? "works" :
				currentSection?.classList.contains("main__section-behind") ? "behind" : null;
		if (active && sliderInstances[active]) sliderInstances[active].refresh();
	});

	function setActiveDeco(activeLink) {
		document.querySelectorAll(".decoLink").forEach(link => link.style.color = "");
		if (activeLink) activeLink.style.color = "var(--black)";
	}
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
			//gsap.set(actives, { xPercent: 120, autoAlpha: 0 });

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
function showContent(triggerEl) {
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
		opacity: 1,
		visibility: "visible",
		margin: 0,
		zIndex: 99999,
		pointerEvents: "none",
		transform: "translateZ(0)"
	});

	fly.querySelectorAll("img").forEach(img => {
		img.style.width = "100%";
		img.style.height = "100%";
		img.style.objectFit = "cover";
		img.style.opacity = "1";
		img.style.visibility = "visible";
		img.style.filter = "none";
	});

	document.body.appendChild(fly);

	const backBtn = container.querySelector(".backButton");
	const backEvent = container.querySelector(".show_works-wrapper, .show_behind-wrapper");
	const handleEsc = (e) => {
		if (e.key === "Escape") {
			backEvent.scrollTo({ top: 0, left: 0, behavior: "smooth" });
			container.__tl?.reverse();
		}
	};
	const handleBack = () => {
		backEvent.scrollTo({ top: 0, left: 0, behavior: "smooth" });
		container.__tl?.reverse();
	};

	const flyImages = fly.querySelectorAll("img");
	const firstImg = flyImages[0];
	const aspectRatio = firstImg.naturalHeight / firstImg.naturalWidth;
	const calculatedHeight = vw * aspectRatio;

	// --- MASTER ---
	const tl = gsap.timeline({
		defaults: { ease: "power3.inOut" },
		onStart: () => {
			container.style.display = "flex";
			container.style.pointerEvents = "auto";
			container.style.zIndex = 10000;
			container.querySelector(".show_works-upper div span, .show_behind-upper div span").style.display = "none";
			gsap.set(container, { autoAlpha: 0 });
			document.addEventListener("keydown", handleEsc);
			if (backBtn) backBtn.addEventListener("click", handleBack, { once: true });
		},
		onReverseComplete: () => {
			try { fly.remove(); } catch (e) { }
			container.style.display = "none";
			container.style.pointerEvents = "none";
			container.style.zIndex = "";
			gsap.set(container, { clearProps: "all" });
			document.removeEventListener("keydown", handleEsc);
		}
	});

	// --- ANIMATIONS ---
	tl.to(fly.querySelector(".works_heading, .behind_heading"), { xPercent: 10000, ease: "power2.in" });
	tl.to(fly.querySelector(".works_details, .behind_details"), { xPercent: -10000, ease: "power2.in" }, "<");
	tl.to(fly, { autoAlpha: 1, width: vw, height: "100dvh", top: 0, left: 0, duration: 0.5, ease: "back.out(1)" });
	tl.addLabel("sicc");

	tl.set(container, { autoAlpha: 1 });
	if (window.matchMedia("(orientation: portrait)").matches) {
		tl.to(fly, { top: "20vh", height: calculatedHeight, duration: 0.5, ease: "back.out(1.2)" }, "sicc-=0.1");
	} else {
		tl.to(fly, { top: "30vh", height: calculatedHeight, duration: 0.5, ease: "back.out(1.2)" }, "sicc-=0.1");
	}

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

function aboutContent() {

	const sections = gsap.utils.toArray(".about_section");
	sections.forEach(section => {
		const divs = section.querySelectorAll("div");

		const tl = gsap.timeline({
			paused: true,
			scrollTrigger: {
				trigger: section,
				start: "top 80%",
				end: "bottom 20%",
				toggleActions: "play none none none"
			}
		});

		tl.fromTo(divs,
			{ autoAlpha: 0, y: 100 },
			{ autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out", stagger: { each: 0.1, start: "start" } },
		);
	});
}

async function initGlobal() {
	await switchLang();
	await switchMain();
	decoLink();
}
initGlobal();