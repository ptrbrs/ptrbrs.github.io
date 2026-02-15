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
				if (distance === 0) return;

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
	if (!window.PROJECT_DB) {
		console.warn('PROJECT_DB not ready yet');
		return [];
	}
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

	Analytics.trackProjectOpen(slug, project.title);

	currentProjectSlug = slug;

	lastScrollY = window.scrollY;
	document.body.style.overflow || '';

	setMeta({
		title: project.title,
		description: project.description,
		keywords: project.keywords
	});

	const projectImage = document.getElementById('projectImage');
	const projectHead = document.getElementById('projectHead');
	const projectDetails = document.getElementById('projectDetails');
	const projectBrief = document.getElementById('projectBrief');
	const projectExecution = document.getElementById('projectExecution');
	const projectResult = document.getElementById('projectResult');
	const projectLayer = document.getElementById('projectLayer');
	//const projectIntroduce = document.getElementById('projectIntroduce');
	//const projectParagraph = document.getElementById('projectParagraph');

	const heroImg = document.getElementById('projectImage');
	heroImg.src = project.image || '';
	heroImg.alt = project.headline || '';
	heroImg.loading = 'lazy';

	if (projectHead) projectHead.textContent = project.headline || '';
	if (projectDetails) projectDetails.textContent = project.details || '';
	if (projectTags) projectTags.innerHTML = project.tags || '';
	if (projectBrief) projectBrief.innerHTML = project.brief || '';
	if (projectExecution) projectExecution.innerHTML = project.execution || '';
	if (projectResult) projectResult.innerHTML = project.result || '';
	//if (projectIntroduce) projectIntroduce.innerHTML = project.introduce || '';
	//if (projectParagraph) projectParagraph.innerHTML = project.paragraph || '';

	const gallery = document.getElementById('projectGallery');
	gallery.innerHTML = '';

	Object.keys(project).forEach(key => {
		if (!/^image\d+$/.test(key)) return;

		const imgSrc = project[key];
		if (!imgSrc) return;

		const li = document.createElement('li');
		li.className = 'link';

		const link = document.createElement('a');
		link.href = imgSrc;
		link.setAttribute('aria-label', project[key + 'capt'] || 'Project image');

		const img = document.createElement('img');
		img.src = imgSrc;
		img.alt = project[key + 'capt'] || '';
		img.loading = 'lazy';

		link.appendChild(img);
		li.appendChild(link);
		gallery.appendChild(li);
	});

	// LIGHTBOX GALLERY
	const images = [...gallery.querySelectorAll('li img')];
	let currentIndex = 0;

	images.forEach((img, index) => {
		img.addEventListener('click', e => {
			e.preventDefault();
			currentIndex = index;
			openLightbox(img);
		});
	});
	const lightbox = document.getElementById('lightbox');
	const bg = lightbox.querySelector('.lightbox__bg');
	const caption = lightbox.querySelector('.lightbox__caption');

	let activeImg = null;
	let originRect = null;

	function openLightbox(img) {

		if (!img.complete || img.naturalWidth === 0) {
			img.onload = () => openLightbox(img);
			return;
		}

		originRect = img.getBoundingClientRect();

		const naturalRatio = img.naturalWidth / img.naturalHeight;

		const startHeight = originRect.height;
		const startWidth = startHeight * naturalRatio;

		const startLeft = originRect.left + (originRect.width - startWidth) / 2;
		const startTop = originRect.top;

		activeImg = img.cloneNode();
		activeImg.style.position = 'fixed';
		activeImg.style.top = startTop + 'px';
		activeImg.style.left = startLeft + 'px';
		activeImg.style.width = startWidth + 'px';
		activeImg.style.height = startHeight + 'px';
		activeImg.style.objectFit = 'contain';
		activeImg.style.opacity = 0;

		//document.body.appendChild(activeImg);
		lightbox.appendChild(activeImg);

		lightbox.style.display = 'block';

		const vw = window.innerWidth;
		const vh = window.innerHeight;

		let targetWidth = vw;
		let targetHeight = vw / naturalRatio;

		if (targetHeight < vh) {
			targetHeight = vh;
			targetWidth = vh * naturalRatio;
		}

		const centerX = vw / 2;
		const centerY = vh / 2;

		const tl = gsap.timeline();

		gsap.set(caption, { opacity: 0, y: 25 });

		tl.to(bg, { opacity: 1 })

			.to(activeImg, {
				autoAlpha: 1,
				duration: 0.25
			}, 0)

			.to(activeImg, {
				width: targetWidth,
				height: targetHeight,
				top: centerY - targetHeight / 2,
				left: centerX - targetWidth / 2,
				duration: 0.4,
				ease: "back.inOut(1.4)"
			}, 0.25)

			.to(activeImg, {
				width: vw * 0.9,
				height: (vw * 0.9) / naturalRatio,
				top: centerY - ((vw * 0.9) / naturalRatio) / 2,
				left: centerX - (vw * 0.9) / 2,
				duration: 0.4,
				ease: "back.out(1.4)"
			});

		caption.textContent = img.alt || '';
		gsap.to(caption, { opacity: 1, y: 0, duration: 0.25, delay: 1 });
	}

	lightbox.querySelector('.prev').addEventListener('click', () => {
		navigate(-1);
	});

	lightbox.querySelector('.next').addEventListener('click', () => {
		navigate(1);
	});

	function navigate(dir) {

		const images = [...document.querySelectorAll('#projectGallery li img')];
		const nextIndex = (currentIndex + dir + images.length) % images.length;
		const nextImgOriginal = images[nextIndex];

		if (!nextImgOriginal.complete || nextImgOriginal.naturalWidth === 0) {
			nextImgOriginal.onload = () => navigate(dir);
			return;
		}

		const vw = window.innerWidth;
		const vh = window.innerHeight;

		const naturalRatio = nextImgOriginal.naturalWidth / nextImgOriginal.naturalHeight;

		const targetWidth = vw * 0.9;
		const targetHeight = targetWidth / naturalRatio;

		const centerX = vw / 2;
		const centerY = vh / 2;

		const nextImg = nextImgOriginal.cloneNode();
		nextImg.style.position = 'fixed';
		nextImg.style.width = targetWidth + 'px';
		nextImg.style.height = targetHeight + 'px';
		nextImg.style.top = centerY - targetHeight / 2 + 'px';
		nextImg.style.objectFit = 'contain';
		nextImg.style.zIndex = 2;

		lightbox.appendChild(nextImg);

		const offset = dir === 1 ? vw : -vw;
		nextImg.style.left = centerX - targetWidth / 2 + offset + 'px';

		const tl = gsap.timeline({
			onComplete: () => {
				activeImg.remove();
				activeImg = nextImg;
				currentIndex = nextIndex;
			}
		});

		tl.to(activeImg, {
			left: `+=${-offset}`,
			duration: 0.5,
			ease: "back.inOut(1.4)"
		}, 0)

			.to(nextImg, {
				left: centerX - targetWidth / 2,
				duration: 0.5,
				ease: "back.inOut(1.4)"
			}, 0);

		gsap.to(caption, { opacity: 0, y: 25, duration: 0.25 });
		caption.textContent = nextImgOriginal.alt || '';
		gsap.to(caption, { opacity: 1, y: 0, duration: 0.25, delay: 0.3 });
	}

	lightbox.addEventListener('click', e => {
		if (e.target !== lightbox && !e.target.classList.contains('lightbox__bg')) return;
		closeLightbox();
	});

	function closeLightbox() {

		const images = [...document.querySelectorAll('#projectGallery li img')];
		const originalImg = images[currentIndex];

		if (!originalImg) return;

		const rect = originalImg.getBoundingClientRect();
		const naturalRatio = originalImg.naturalWidth / originalImg.naturalHeight;

		const endHeight = rect.height;
		const endWidth = endHeight * naturalRatio;

		const endLeft = rect.left + (rect.width - endWidth) / 2;
		const endTop = rect.top;

		const tl = gsap.timeline({
			onComplete: () => {
				activeImg.remove();
				lightbox.style.display = 'none';
			}
		});

		tl.to(caption, { opacity: 0, y: 25, duration: 0.25 }, 0)

			.to(activeImg, {
				width: endWidth,
				height: endHeight,
				top: endTop,
				left: endLeft,
				duration: 0.4,
				ease: "back.in(1.4)"
			})

			.to(bg, { opacity: 0, duration: 0.3 })

			.to(activeImg, {
				autoAlpha: 0,
				duration: 0.2
			}, "-=0.2");
	}

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

	gsap.set(".animate", { y: 25, autoAlpha: 0 });
	gsap.set([projectImage], { autoAlpha: 0 });

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
					gsap.set([projectImage], { autoAlpha: 1 });
					clone.remove();
					gsap.to(".animate", { autoAlpha: 1, y: 0, stagger: { each: 0.025, from: "start" } });
				}
			});
		}
	});
}

function animateCloseProject() {
	if (!currentProjectSlug) return;

	Analytics.trackProjectClose();

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

	gsap.to(".animate", { y: 25, autoAlpha: 0, stagger: { each: 0.025, from: "end" } });

	gsap.to(clone, {
		top: 0,
		left: 0,
		width: window.innerWidth,
		height: "100dvh",
		duration: 0.5,
		ease: "back.out(2)",
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

	const strong = li.querySelector('.projects_overlay strong');
	const em = li.querySelector('.projects_overlay em');
	gsap.set([strong, em], { clearProps: 'all' });

	setMeta(ORIGINAL_META);
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

const closeLayer = document.getElementById('closeLayer');

if (closeLayer) {
	closeLayer.addEventListener('click', () => {
		if (!currentProjectSlug) return;
		animateCloseProject();
	});
}

let isSliding = false;
function slideProject(direction) {
	if (isSliding) return;

	const targetSlug = getAdjacentSlug(direction);
	if (!targetSlug) return;

	Analytics.trackProjectSlide(direction, currentProjectSlug, targetSlug);

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
	if (!Array.isArray(slugs) || slugs.length === 0) return null;

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

document.addEventListener('DOMContentLoaded', () => {
	Analytics.init();
	initProjectList();
	bindProjectNav();
	bindProjectNavHelpers();
	decoLink();
	explosion();
	experienceAccordion();
});
