/* BASE LANGUAGE */
async function getLanguageData(lang) {
	switch (lang) {
		case 'en':
			return await import('./lang/en.js');
		case 'es':
			return await import('./lang/es.js');
		default:
			return await import('./lang/en.js');
	}
}
function detectLanguage() {
	const urlParams = new URLSearchParams(window.location.search);
	const langFromUrl = urlParams.get('lang');

	if (langFromUrl) return langFromUrl;

	const browserLang = navigator.language || navigator.languages[0];
	const shortLang = browserLang.split('-')[0];
	const regionLang = browserLang;

	if (regionLang === 'es-MX') return 'es';
	if (regionLang === 'es-ES') return 'es';

	return ['en', 'es'].includes(shortLang) ? shortLang : 'en';
}
async function langswitch() {
	const lang = detectLanguage();
	const lng = await getLanguageData(lang);
	const langData = lng.default || lng;

	function applyLanguage(data) {
		document.querySelectorAll('[data-lang]').forEach(element => {
			const key = element.getAttribute('data-lang');
			const value = data[key];
			if (value) {
				element.innerHTML = value;
				element.setAttribute('data-content', value);
			}
		});
	}

	function updateActiveButton(lang) {
		const buttons = document.querySelectorAll('button');
		buttons.forEach(button => {
			button.classList.toggle('active', button.id === 'lang_' + lang);
		});
	}

	function updateLinksForLanguage(lang) {
		const links = document.querySelectorAll('a');
		links.forEach(link => {
			const originalUrl = new URL(link.href, window.location.href);
			originalUrl.searchParams.set('lang', lang);
			link.href = originalUrl.toString();
		});
	}

	applyLanguage(lng.default);
	updateActiveButton(lang);
	updateLinksForLanguage(lang);
}


/* CONTENT DATA */
async function getContentData(lang) {
	switch (lang) {
		case 'en':
			return await import('./content/en.js');
		case 'es':
			return await import('./content/es.js');
		default:
			return await import('./content/en.js');
	}
}
function getCurrentPage() {
	const urlParams = new URLSearchParams(window.location.search);
	//return urlParams.get('content') || 'content1';
	return urlParams.get('content');
}
function getCurrentLang() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('lang') || 'en';
}
async function contentSwitcher() {
	const lang = getCurrentLang();
	const contentData = (await getContentData(lang)).default;

	function clearContainerContent(container) {
		container.querySelectorAll("[data-content]").forEach(el => {
			if (el.tagName === "IMG") {
				el.src = "";
			} else {
				el.innerHTML = "";
			}
		});

		const imageContainer = container.querySelector('.showWork-img');
		if (imageContainer) {
			imageContainer.innerHTML = '';
		}
	}
	function loadContentToContainer(pageId) {
		const container = document.querySelector('.showWork');
		if (!container) return;

		const content = contentData[pageId];
		if (!content) return;

		clearContainerContent(container);

		container.querySelectorAll("[data-content]").forEach(el => {
			const key = el.getAttribute("data-content");
			if (content[key] !== undefined) {
				if (el.tagName === "IMG") {
					el.src = content[key];
				} else {
					el.innerHTML = content[key];
				}
			}
		});
		const imageContainer = container.querySelector('.showWork-img');
		if (imageContainer) {
			Object.keys(content)
				.filter(key => /^image\d+$/.test(key))
				.forEach(key => {
					const img = document.createElement('img');
					img.src = content[key];
					img.alt = key;

					const figure = document.createElement('figure');
					figure.appendChild(img);

					const captionKey = `${key}capt`;
					if (content[captionKey]) {
						const figcaption = document.createElement('figcaption');
						figcaption.textContent = content[captionKey];
						figure.appendChild(figcaption);
					}

					imageContainer.appendChild(figure);
				});
		}
	}
	function loadPreviewContent() {
		const previewContainers = document.querySelectorAll('.ps__sect[data-page]');
		previewContainers.forEach(previewContainer => {
			const pageId = previewContainer.getAttribute('data-page');
			const content = contentData[pageId];
			if (!content) return;

			['image', 'number', 'title', 'details'].forEach(key => {
				const el = previewContainer.querySelector(`[data-content="${key}"]`);
				if (el) {
					if (el.tagName === "IMG") {
						el.src = content[key];
					} else {
						el.innerHTML = content[key];
					}
				}
			});
		});
	}
	document.querySelectorAll('[data-page]').forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();

			const pageId = link.getAttribute('data-page');
			loadContentToContainer(pageId);
		});
	});
	loadPreviewContent();
}
/* ABOUT DATA */
async function loadAboutContent() {
	const lang = getCurrentLang();
	const contentData = (await getContentData(lang)).default;
	const aboutContent = contentData['about'];
	if (!aboutContent) return;

	const aboutSection = document.querySelector('#main__section-about [data-page="about"]');
	if (!aboutSection) return;

	aboutSection.querySelectorAll('[data-content]').forEach(el => {
		const key = el.getAttribute('data-content');
		const value = aboutContent[key];
		if (value === undefined) return;

		if (el.tagName === 'IMG') {
			el.src = value;
		} else if (/^image\d+$/.test(key)) {
			el.innerHTML = '';
			const img = document.createElement('img');
			img.src = value;
			//img.alt = key;
			el.appendChild(img);
		} else {
			el.innerHTML = value;
		}
	});
}
document.addEventListener('DOMContentLoaded', () => {
	loadAboutContent();
});


console.clear();
gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText, MorphSVGPlugin, ScrollToPlugin);
gsap.config({
	//nullTargetWarn: false,
});


CustomEase.create("menuIcon", "M0,0 C0,0 0.02,0.098 0.128,0.098 0.242,0.098 0.13,-0.1 0.3,-0.1 0.5,-0.1 0.49,1.1 0.7,1.1 0.856,1.1 0.778,0.896 0.882,0.896 0.976,0.896 1,1 1,1");
CustomEase.create("custom", "M0,0 C0,0.198 0.1,0.6 0.3,0.8 0.501,1.001 0.818,1.001 1,1");
CustomEase.create("toFullSize", "M0,0 C0,0 0.092,0.3 0.2,0.3 0.314,0.3 0.33,-0.1 0.5,-0.1 0.7,-0.1 1,1 1,1");


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
				color: 'var(--grey-md)',
				overflow: 'hidden'
			});

			Object.assign(hoverLayer.style, {
				position: 'absolute',
				width: '100%',
				top: '0',
				left: '0',
				color: 'var(--black)',
				clipPath: 'polygon(0 0, 0 0, 0% 100%, 0 100%)',
				transition: 'clip-path 0.2s ease-in-out',
				pointerEvents: 'none',
			});

			el.appendChild(hoverLayer);

			el.addEventListener('mouseenter', () => {
				hoverLayer.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
			});

			el.addEventListener('mouseleave', () => {
				hoverLayer.style.clipPath = 'polygon(0 0, 0 0, 0% 100%, 0 100%)';
			});
		});

		const image = container.querySelector('.ps__img');
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


function mainHome() {
	const splits = gsap.utils.toArray(".home__heading"),

		split = new SplitText(splits, {
			type: "words"
		});

	gsap.to(splits, {
		autoAlpha: 1
	});
	gsap.fromTo(split.words, {
		autoAlpha: 0,
		yPercent: 50
	}, {
		autoAlpha: 1,
		yPercent: 0,
		duration: 0.25,
		ease: "power4.inOut",
		stagger: {
			each: 0.1,
			from: "start"
		}
	}, 0.5);
}


let pageSliderLocked = false;
function mainWorks() {

	const targets = gsap.utils.toArray(".ps__sect");
	if (!targets.length) return;

	let sections = document.querySelectorAll(".ps__sect"),
		images = document.querySelectorAll(".ps__img, .ps__img-first"),
		headings = gsap.utils.toArray(".ps__heading"),
		outerWrappers = gsap.utils.toArray(".ps__outer"),
		innerWrappers = gsap.utils.toArray(".ps__inner"),
		splitHeadings = headings.map(heading => new SplitText(heading, { type: "words", wordsClass: "clip-text", tag: "span" })),
		currentIndex = -1,
		wrap = gsap.utils.wrap(0, sections.length),
		animating;

	gsap.set(outerWrappers, { yPercent: 100 });
	gsap.set(innerWrappers, { yPercent: -100 });

	function gotoSection(index, direction) {
		index = wrap(index);
		animating = true;

		let fromTop = direction === -1,
			dFactor = fromTop ? -1 : 1,
			tl = gsap.timeline({
				defaults: { duration: 0.5, ease: "power1.inOut" },
				onComplete: () => animating = false
			});
		if (currentIndex >= 0) {
			gsap.set(sections[currentIndex], { zIndex: 0 });
			tl.to(images[currentIndex], { yPercent: -15 * dFactor })
				.set(sections[currentIndex], { autoAlpha: 0 });
		}
		gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
		tl.fromTo([outerWrappers[index], innerWrappers[index]], {
			yPercent: i => i ? -100 * dFactor : 100 * dFactor
		}, {
			yPercent: 0
		}, 0)
			.fromTo(images[index], {
				yPercent: 15 * dFactor
			}, {
				yPercent: 0
			}, 0)
			.fromTo(splitHeadings[index].words, {
				autoAlpha: 0,
				yPercent: 50 * dFactor
			}, {
				autoAlpha: 1,
				yPercent: 0,
				duration: 0.25,
				ease: "power4",
				stagger: {
					each: 0.15,
					from: "start"
				}
			}, 0.5);

		currentIndex = index;
	}

	ScrollTrigger.observe({
		type: "wheel,touch,pointer",
		wheelSpeed: -1,
		onDown: () => !animating && !pageSliderLocked && gotoSection(currentIndex - 1, -1),
		onUp: () => !animating && !pageSliderLocked && gotoSection(currentIndex + 1, 1),
		tolerance: 10,
		preventDefault: false
	});

	gotoSection(0, 1);
}


function mainAbout() {

	const titles = document.querySelectorAll(".contentTitle");
	const details = document.querySelectorAll(".contentDetails");
	const secondDiv = document.querySelector(".secondDIV");

	gsap.registerPlugin(ScrollToPlugin);

	// Kezdő állapot
	titles.forEach(t => t.classList.remove("contentTitle-active"));
	titles[0].classList.add("contentTitle-active");

	// Kattintás esemény minden címre
	titles.forEach((titleEl, i) => {
		titleEl.addEventListener("click", () => {
			gsap.to(secondDiv, {
				duration: 1.2,
				scrollTo: {
					y: details[i],
					offsetY: 0
				},
				ease: "power3.inOut"
			});

			titles.forEach(t => t.classList.remove("contentTitle-active"));
			titleEl.classList.add("contentTitle-active");
		});
	});

	// ScrollTrigger minden .contentDetails elemhez
	details.forEach((detailEl, i) => {
		ScrollTrigger.create({
			trigger: detailEl,
			start: "top center",
			end: "bottom center",
			scroller: secondDiv,
			onEnter: () => updateActiveTitle(i),
			onEnterBack: () => updateActiveTitle(i)
		});
	});

	function updateActiveTitle(index) {
		titles.forEach(t => t.classList.remove("contentTitle-active"));
		titles[index].classList.add("contentTitle-active");
	}
}


function menuAnimation() {
	var tl = new TimelineLite({ paused: true, reversed: true });

	tl.to('.rightUp-line', 1, { morphSVG: '.rightUpE', ease: "menuIcon" }, 'start')
		.to('.rightDown-line', 1, { morphSVG: '.rightDownE', ease: "menuIcon" }, 'start')
		.to('.leftUp', 1, { morphSVG: '.leftUpE', ease: "menuIcon" }, 'start')
		.to('.leftDown', 1, { morphSVG: '.leftDownE', ease: "menuIcon" }, 'start');

	var menuBTN = document.querySelector(".menu__button"),
		menuInner = document.querySelector("nav");

	let currentSection = document.querySelector('#main__section-home'); // initial active
	let mainActual = currentSection;
	let mainNext = null;

	const sectionMap = {
		nav_home: '#main__section-home',
		nav_works: '#main__section-works',
		nav_about: '#main__section-about',
	};

	var ma = gsap.timeline({
		paused: true,
		reversed: true,
		onReverseComplete: function () {
			if (pendingTargetSection && pendingTargetSection !== currentSection) {
				switchSection(pendingTargetSection);
			}
		}
	})
		.to(menuInner, { width: "100%", ease: "elastic.out(1,0.1)" })
		.fromTo(".menu__content div", {
			y: 200,
			opacity: 0
		}, {
			y: 0,
			opacity: 1,
			duration: 0.25,
			stagger: {
				each: 0.15,
				from: "start"
			}
		}, "<0.3");

	function menuAnim() {
		menuBTN.classList.toggle("is-active");
		tl.reversed() ? tl.play() : tl.reverse();
		ma.reversed() ? ma.play() : ma.reverse();
	}

	menuBTN.addEventListener("click", menuAnim);

	let pendingTargetSection = null;

	function switchSection(targetSection) {
		mainActual = currentSection;
		mainNext = targetSection;

		const switchTl = gsap.timeline({
			onComplete: () => {
				mainActual.style.visibility = "hidden";
				currentSection = mainNext;
				pendingTargetSection = null;
			}
		});

		// SLIDE OUT (mainActual)
		switchTl.to(mainActual, {
			autoAlpha: 0,
			//y: -100,
			height: "0dvh",
			top: "0",
			duration: 0.5,
			ease: "power2.in"
		});

		// SLIDE IN (mainNext)
		switchTl.set(mainNext, {
			visibility: "visible",
			//y: 100
		})
			.fromTo(mainNext, {
				autoAlpha: 0,
				//y: 100,
				height: "0dvh",
				top: "100%",
				bottom: "0"
			}, {
				autoAlpha: 1,
				//y: 0,
				height: "100dvh",
				bottom: "0",
				top: "0",
				duration: 0.5,
				ease: "power2.out"
			});
	}

	var links = document.querySelectorAll(".menu__content .navPage");

	links.forEach(function (link) {
		link.addEventListener("click", function () {
			const langKey = link.getAttribute("data-lang");
			const selector = sectionMap[langKey];
			const targetSection = document.querySelector(selector);

			if (!selector || !targetSection || targetSection === currentSection) return;

			pendingTargetSection = targetSection;
			menuAnim(); // triggers .reverse() → `onReverseComplete` → `switchSection`
		});
	});
}


function scrollAnim() {
	gsap.utils.toArray(".scrollAnim").forEach(function (thisBox) {

		var thisIcon = thisBox.querySelectorAll(".scrollAnim svg");

		gsap.timeline({ repeat: -1, yoyo: true })
			.to(thisIcon, {
				y: 10,
				duration: 0.5,
				ease: 'none'
			});
	});
}


function showWorks() {
	const containers = document.querySelectorAll('.ps__cont');
	const showContainer = document.querySelector('.showWork');
	const showContents = document.querySelectorAll('.showWork div');
	const backButtons = document.querySelectorAll('.backButton');

	let activeTimeline = null;
	let lastTriggered = null;

	containers.forEach(container => {
		const heading = container.querySelector('.ps__heading');
		const image = container.querySelector('.ps__img');

		[heading, image].forEach(trigger => {
			trigger.addEventListener('click', () => {
				if (activeTimeline && activeTimeline.isActive()) return;

				lastTriggered = { heading, image };

				activeTimeline = gsap.timeline();

				activeTimeline
					.set(showContainer, {
						visibility: "visible",
						y: 0,
						onComplete: () => {
							requestAnimationFrame(() => {
								requestAnimationFrame(() => {
									if (window.matchMedia("(orientation: portrait)").matches) {
										showContainer.scrollTop = 0;
									} else {
										const secondCol = showContainer.querySelector('.showWork-secondCol');
										if (secondCol) secondCol.scrollTop = 0;
									}
								});
							});
						}
					})
					.fromTo([heading, image], {
						autoAlpha: 1,
						yPercent: 1,
					}, {
						autoAlpha: 0,
						yPercent: -100,
						stagger: {
							each: 0.1,
							from: "start"
						},
						ease: "power1.inOut"
					})
					.fromTo(".menu__button", {
						autoAlpha: 1
					}, {
						autoAlpha: 0,
						x: 100,
						ease: "elastic.in(1,0.2)"
					}, "<")
					.fromTo(showContainer, {
						autoAlpha: 0
					}, {
						autoAlpha: 1,
						ease: "power2.out"
					})
					.fromTo(showContents, {
						autoAlpha: 0,
						yPercent: 100,
					}, {
						autoAlpha: 1,
						yPercent: 0,
						stagger: {
							each: 0.1,
							from: "start"
						},
						ease: "power1.inOut"
					}, "<")
					.fromTo(backButtons, {
						autoAlpha: 0,
						x: 100
					}, {
						autoAlpha: 1,
						x: 0,
						ease: "elastic.out(1,0.2)"
					});

				pageSliderLocked = true;
			});
		});
	});

	backButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			if (!lastTriggered) return;

			const { heading, image } = lastTriggered;

			const closeTimeline = gsap.timeline({
				onComplete: () => {
					gsap.set([heading, image, showContainer], {
						clearProps: "all"
					});
					gsap.set(showContainer, { visibility: "hidden" });
					lastTriggered = null;
					pageSliderLocked = false;
				}
			});

			closeTimeline
				.fromTo(showContents, {
					autoAlpha: 1,
					yPercent: 0,
				}, {
					autoAlpha: 0,
					yPercent: -100,
					stagger: {
						each: 0.1,
						from: "start"
					},
					ease: "power1.inOut"
				})
				.to(showContainer, {
					autoAlpha: 0,
					ease: "power1.inOut"
				})
				.fromTo([heading, image], {
					autoAlpha: 0,
					yPercent: 100,
				}, {
					autoAlpha: 1,
					yPercent: 0,
					stagger: {
						each: 0.1,
						from: "start"
					},
					ease: "power1.inOut"
				}, "<")
				.fromTo(backButtons, {
					autoAlpha: 1,
					x: 0
				}, {
					autoAlpha: 0,
					x: 100,
					ease: "elastic.in(1,0.2)"
				})
				.fromTo(".menu__button", {
					autoAlpha: 0,
					x: 100
				}, {
					autoAlpha: 1,
					x: 0,
					ease: "elastic.out(1,0.2)"
				}, "<");
		});
	});
}


async function initApp() {
	await langswitch();
	await contentSwitcher();

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			decoLink();
			mainHome();
			mainWorks();
			mainAbout();
			menuAnimation();
			scrollAnim();
			showWorks();
		});
	});
}
initApp();