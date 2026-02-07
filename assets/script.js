gsap.registerPlugin(ScrollTrigger);

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
				transition: 'clip-path 0.15s ease-in-out',
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

function explosion() {
	const items = document.querySelectorAll('.projects_ul li');
	const baseGap = 8;
	const maxPush = 160;

	items.forEach(epicenter => {
		epicenter.addEventListener('mouseenter', () => {
			const e = epicenter.getBoundingClientRect();

			items.forEach(item => {
				if (item === epicenter) return;

				const b = item.getBoundingClientRect();

				const dx = (b.left + b.width / 2) - (e.left + e.width / 2);
				const dy = (b.top + b.height / 2) - (e.top + e.height / 2);

				const distance = Math.hypot(dx, dy);

				const multiplier = Math.pow(distance / 300, 3);
				const push = Math.min(multiplier * baseGap, maxPush);

				const nx = dx / distance;
				const ny = dy / distance;

				item.style.transform = `
                translate(
                    ${nx * push}px,
                    ${ny * push}px
                )
            `;
			});
		});

		epicenter.addEventListener('mouseleave', () => {
			items.forEach(item => {
				item.style.transform = '';
			});
		});
	});
}

function getProjectSlugs() {
	return Object.keys(window.PROJECT_DB).sort();
}

let currentProjectSlug = null;
const ORIGINAL_META = {
	title: document.title,
	description: document.querySelector('meta[name="description"]')?.content || '',
	keywords: document.querySelector('meta[name="keywords"]')?.content || ''
};

function setMeta({ title, description, keywords }) {
	if (title) document.title = title;
	if (description !== undefined)
		document.querySelector('meta[name="description"]')?.setAttribute('content', description);
	if (keywords !== undefined)
		document.querySelector('meta[name="keywords"]')?.setAttribute('content', keywords);
}

function initProjectList() {
	const DB = window.PROJECT_DB;
	if (!DB) return;

	document.querySelectorAll('.projects_ul li').forEach(li => {
		const slug = li.dataset.project;
		const project = DB[slug];
		if (!project) return;

		const img = li.querySelector('img');
		if (img) img.src = project.image;

		const strong = li.querySelector('.projects_overlay strong');
		const em = li.querySelector('.projects_overlay em');

		if (strong) strong.textContent = project.headline;
		if (em) em.textContent = project.details;

		li.addEventListener('mouseenter', () => {
			li.classList.add('hover');
		});
		li.addEventListener('mouseleave', () => {
			li.classList.remove('hover');
		});
	});
}

let lastScrollY = 0;
function openProject(slug) {
	const DB = window.PROJECT_DB;
	const project = DB[slug];
	if (!project) return;

	// GA tracking
	if (window.gtag) {
		gtag('event', 'project_open', {
			project_slug: slug,
			project_title: project.title,
			page_path: location.pathname
		});
	}

	currentProjectSlug = slug;

	lastScrollY = window.scrollY;
	document.body.style.overflow || '';

	setMeta({
		title: project.title,
		description: project.description,
		keywords: project.keywords
	});

	const heroImg = document.getElementById('projectImage');
	heroImg.src = project.image || '';
	heroImg.alt = project.headline || '';
	heroImg.loading = 'lazy';

	document.getElementById('projectHead').textContent = project.headline || '';
	document.getElementById('projectDetails').textContent = project.details || '';
	document.getElementById('projectTags').innerHTML = project.tags || '';
	document.getElementById('projectBrief').innerHTML = project.brief || '';
	document.getElementById('projectExecution').innerHTML = project.execution || '';
	document.getElementById('projectResult').innerHTML = project.result || '';
	//document.getElementById('projectIntroduce').innerHTML = project.introduce || '';
	//document.getElementById('projectParagraph').innerHTML = project.paragraph || '';

	const gallery = document.getElementById('projectGallery');
	gallery.innerHTML = '';

	Object.keys(project).forEach(key => {
		if (!/^image\d+$/.test(key)) return;

		const imgSrc = project[key];
		if (!imgSrc) return;

		const wrapper = document.createElement('figure');
		wrapper.className = 'project-gallery-item';

		const img = document.createElement('img');
		img.src = imgSrc;
		img.alt = project[key + 'capt'] || '';
		img.loading = 'lazy';

		wrapper.appendChild(img);

		if (project[key + 'capt']) {
			const caption = document.createElement('figcaption');
			caption.textContent = project[key + 'capt'];
			wrapper.appendChild(caption);
		}

		gallery.appendChild(wrapper);
	});
}

function bindProjectNav() {
	document.getElementById('projectPrev')
		?.addEventListener('click', () => slideProject('prev'));

	document.getElementById('projectNext')
		?.addEventListener('click', () => slideProject('next'));
}

function closeProject() {
	document.getElementById('projectLayer').classList.add('hidden');
	document.body.style.overflow = '';

	window.scrollTo({ top: lastScrollY, behavior: 'auto' });

	currentProjectSlug = null;
	setMeta(ORIGINAL_META);
}

const cursorHelper = document.createElement('div');
cursorHelper.id = 'projectCursorHelper';
cursorHelper.style.position = 'fixed';
cursorHelper.style.pointerEvents = 'none';
cursorHelper.style.zIndex = '9999';
cursorHelper.style.padding = '0.5rem 0.75rem';
cursorHelper.style.background = 'rgba(0,0,0,0.75)';
cursorHelper.style.color = '#fff';
cursorHelper.style.fontSize = '0.875rem';
cursorHelper.style.borderRadius = '0.4rem';
cursorHelper.style.opacity = '0';
cursorHelper.style.transition = 'opacity 0.15s ease';
document.body.appendChild(cursorHelper);

function getPrevNextSlug(direction) {
	const slugs = getProjectSlugs();
	if (!currentProjectSlug) return null;

	const index = slugs.indexOf(currentProjectSlug);

	if (direction === 'prev') {
		return slugs[(index - 1 + slugs.length) % slugs.length];
	}
	if (direction === 'next') {
		return slugs[(index + 1) % slugs.length];
	}
}

function showHelper(slug) {
	const project = window.PROJECT_DB[slug];
	if (!project) return;

	cursorHelper.textContent = project.headline;
	cursorHelper.style.opacity = '1';
}

function hideHelper() {
	cursorHelper.style.opacity = '0';
}

document.addEventListener('mousemove', e => {
	const offset = 16;
	const helperRect = cursorHelper.getBoundingClientRect();
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	let left = e.clientX + offset;
	let top = e.clientY + offset;

	if (left + helperRect.width > viewportWidth) {
		left = e.clientX - helperRect.width - offset;
	}

	if (top + helperRect.height > viewportHeight) {
		top = e.clientY - helperRect.height - offset;
	}

	cursorHelper.style.left = left + 'px';
	cursorHelper.style.top = top + 'px';
});

function bindProjectNavHelpers() {
	const prev = document.getElementById('projectPrev');
	const next = document.getElementById('projectNext');

	if (prev) {
		prev.addEventListener('mouseenter', () => {
			const slug = getAdjacentSlug('prev');
			if (slug) showHelper(slug);
		});
		prev.addEventListener('mouseleave', hideHelper);
	}

	if (next) {
		next.addEventListener('mouseenter', () => {
			const slug = getAdjacentSlug('next');
			if (slug) showHelper(slug);
		});
		next.addEventListener('mouseleave', hideHelper);
	}
}

document.getElementById('scrollToTopBtn').addEventListener('click', () => {
	const scrollContainer = document.getElementById('projectLayer');
	if (scrollContainer) {
		scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
	}
});

let originalTitle = document.title;
let originalDescription = document.querySelector('meta[name="description"]')?.content || '';
let originalKeywords = document.querySelector('meta[name="keywords"]')?.content || '';

function animateOpenProject(slug) {
	const li = document.querySelector(`.projects_ul li[data-project="${slug}"]`);
	if (!li) return;

	currentProjectSlug = slug;
	lastScrollY = window.scrollY;

	const img = li.querySelector('img');
	const strong = li.querySelector('.projects_overlay strong');
	const em = li.querySelector('.projects_overlay em');

	const imgRect = img.getBoundingClientRect();

	const clone = img.cloneNode(true);
	document.body.appendChild(clone);
	Object.assign(clone.style, {
		position: 'fixed',
		top: `${imgRect.top}px`,
		left: `${imgRect.left}px`,
		width: `${imgRect.width}px`,
		height: `${imgRect.height}px`,
		zIndex: 9999,
		objectFit: 'cover'
	});

	gsap.to([strong, em], { autoAlpha: 0, duration: 0.2 });

	gsap.to(clone, {
		top: 0,
		left: 0,
		width: window.innerWidth,
		height: "100dvh",
		duration: 0.5,
		ease: "back.out(2)",
		onComplete: () => {
			openProject(slug);
			projectLayer.classList.remove('hidden');
			document.body.classList.add('project-open');
			gsap.to(clone, {
				top: 0,
				left: 0,
				width: "100%",
				height: "auto",
				duration: 0.5,
				ease: "back.out(2)",
				onComplete: () => {
					clone.remove();
					gsap.to([
						projectHead,
						projectDetails,
						projectBrief,
						projectExecution,
						projectResult,
						//projectIntroduce,
						//projectParagraph
					], { autoAlpha: 1, duration: 0.3 });
				}
			});
		}
	});
}

function animateCloseProject() {
	if (!currentProjectSlug) return;

	const li = document.querySelector(`.projects_ul li[data-project="${currentProjectSlug}"]`);
	if (!li) return;

	const liImg = li.querySelector('img');
	const liRect = liImg.getBoundingClientRect();
	const projectImgRect = projectImage.getBoundingClientRect();

	const clone = projectImage.cloneNode(true);
	document.body.appendChild(clone);
	Object.assign(clone.style, {
		position: 'fixed',
		top: `${projectImgRect.top}px`,
		left: `${projectImgRect.left}px`,
		width: `${projectImgRect.width}px`,
		height: `${projectImgRect.height}px`,
		zIndex: 9999,
		objectFit: 'cover'
	});

	gsap.to([
		projectHead,
		projectDetails,
		projectBrief,
		projectExecution,
		projectResult,
		//projectIntroduce,
		//projectParagraph
	], { autoAlpha: 0, duration: 0.2 });

	gsap.to(clone, {
		top: 0,
		left: 0,
		width: window.innerWidth,
		height: "100dvh",
		duration: 0.5,
		ease: "back.in(2)",
		onComplete: () => {
			projectLayer.classList.add('hidden');
			document.body.classList.remove('project-open');
			gsap.to(clone, {
				top: `${liRect.top}px`,
				left: `${liRect.left}px`,
				width: `${liRect.width}px`,
				height: `${liRect.height}px`,
				duration: 0.5,
				ease: "back.in(2)",
				onComplete: () => clone.remove()
			});
		}
	});

	document.title = originalTitle;
	document.querySelector('meta[name="description"]')?.setAttribute('content', originalDescription);
	document.querySelector('meta[name="keywords"]')?.setAttribute('content', originalKeywords);

	window.scrollTo({ top: lastScrollY, behavior: 'auto' });

	currentProjectSlug = null;
}

document.querySelectorAll('.projects_ul li').forEach(li => {
	li.addEventListener('click', e => {
		e.preventDefault();
		const slug = li.dataset.project;
		if (!slug) return;

		currentProjectSlug = slug;
		lastScrollY = window.scrollY;
		animateOpenProject(slug);
	});
});

closeLayer.addEventListener('click', () => {
	if (!currentProjectSlug) return;
	animateCloseProject(currentProjectSlug);
	currentProjectSlug = null;
});

let isSliding = false;
function slideProject(direction) {
	if (isSliding) return;

	const targetSlug = getAdjacentSlug(direction);
	if (!targetSlug) return;

	// GA tracking
	if (window.gtag) {
		gtag('event', 'project_slide', {
			direction,
			from: currentProjectSlug,
			to: targetSlug
		});
	}

	isSliding = true;

	const stage = document.getElementById('projectStage');
	const rect = stage.getBoundingClientRect();
	const width = window.innerWidth;

	const clone = stage.cloneNode(true);
	Object.assign(clone.style, {
		position: 'fixed',
		top: rect.top + 'px',
		left: rect.left + 'px',
		width: rect.width + 'px',
		height: rect.height + 'px',
		zIndex: 9999
	});
	document.body.appendChild(clone);

	openProject(targetSlug);

	const enterX = direction === 'next' ? width : -width;
	const exitX = direction === 'next' ? -width : width;

	const scrollContainer = document.getElementById('projectLayer');
	if (scrollContainer) {
		scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
	}

	gsap.set(stage, {
		x: enterX
	});

	gsap.timeline({
		onComplete() {
			clone.remove();
			gsap.set(stage, { x: 0 });
			isSliding = false;
		}
	})
		.to(clone, {
			x: exitX,
			duration: 0.6,
			ease: 'back.inOut(2)'
		}, 0)
		.to(stage, {
			x: 0,
			duration: 0.6,
			ease: 'back.inOut(2)'
		}, 0);
}

function getAdjacentSlug(direction) {
	if (!currentProjectSlug) return null;

	const slugs = getProjectSlugs();
	const index = slugs.indexOf(currentProjectSlug);
	if (index === -1) return null;

	if (direction === 'next') {
		return slugs[(index + 1) % slugs.length];
	}
	if (direction === 'prev') {
		return slugs[(index - 1 + slugs.length) % slugs.length];
	}
}

function experienceAccordion() {
	const containers = document.querySelectorAll('.exp_container');

	containers.forEach(container => {
		const headline = container.querySelector('.exp_headline');
		const content = container.querySelector('.exp_content');

		gsap.set(content, { height: 0 });

		headline.addEventListener('click', () => {
			const isOpen = content.classList.contains('is-open');

			containers.forEach(otherContainer => {
				const otherContent = otherContainer.querySelector('.exp_content');

				if (otherContent !== content) {
					otherContent.classList.remove('is-open');
					gsap.to(otherContent, {
						height: 0,
						duration: 0.5,
						ease: 'power2.inOut'
					});
				}
			});

			if (isOpen) {
				content.classList.remove('is-open');
				gsap.to(content, {
					height: 0,
					duration: 0.5,
					ease: 'power2.inOut'
				});
			} else {
				content.classList.add('is-open');
				gsap.to(content, {
					height: 'auto',
					duration: 0.6,
					ease: 'power2.out'
				});
			}
		});
	});
}

const sections = document.querySelectorAll('main section[data-title]');
let currentSection = null;
let enterTime = null;

function trackSectionEnter(section) {
	if (!window.gtag) return;
	if (currentSection && enterTime) {
		const duration = Math.round((Date.now() - enterTime)/1000);
		gtag('event', 'section_view', {
			section_title: currentSection.dataset.title,
			duration: duration,
			page_path: location.pathname
		});
	}

	currentSection = section;
	enterTime = Date.now();
}

const observer = new IntersectionObserver(entries => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			trackSectionEnter(entry.target);
		}
	});
}, { threshold: 0.5 });

sections.forEach(sec => observer.observe(sec));


document.addEventListener('DOMContentLoaded', () => {
	initProjectList();
	bindProjectNav();
	bindProjectNavHelpers();
	decoLink();
	explosion();
	experienceAccordion();
});