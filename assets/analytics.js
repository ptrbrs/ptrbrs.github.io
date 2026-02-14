/**
 * Centralized GA4 Analytics Module
 * Handles section, project and real user engagement tracking.
 */

const Analytics = (() => {

	let activeSection = null;
	let sectionStartTime = null;

	let activeProject = null;
	let projectStartTime = null;

	let engagementTime = 0;
	let lastActiveTime = Date.now();
	let idleTimer = null;
	let isIdle = false;

	const IDLE_LIMIT = 20000;

	function send(eventName, payload = {}) {
		if (!window.gtag) return;

		gtag('event', eventName, {
			page_path: location.pathname,
			...payload
		});
	}

	/* ================= SECTION TRACKING ================= */

	function trackSectionChange(section) {
		if (activeSection === section) return;

		if (activeSection && sectionStartTime) {
			const duration = getDuration(sectionStartTime);
			send('section_view', {
				section_title: activeSection.dataset.title,
				duration
			});
		}

		activeSection = section;
		sectionStartTime = Date.now();
	}

	function initSectionObserver() {
		const sections = document.querySelectorAll('main section[data-title]');

		const observer = new IntersectionObserver(entries => {
			const visible = entries
				.filter(e => e.intersectionRatio > 0.3)
				.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

			if (!visible.length) return;

			trackSectionChange(visible[0].target);
		}, {
			threshold: buildThresholds()
		});

		sections.forEach(s => observer.observe(s));
	}

	/* ================= PROJECT TRACKING ================= */

	function trackProjectOpen(slug, title) {
		activeProject = slug;
		projectStartTime = Date.now();

		send('project_open', {
			project_slug: slug,
			project_title: title
		});
	}

	function trackProjectClose() {
		if (!activeProject || !projectStartTime) return;

		const duration = getDuration(projectStartTime);

		send('project_view', {
			project_slug: activeProject,
			duration
		});

		activeProject = null;
		projectStartTime = null;
	}

	function trackProjectSlide(direction, from, to) {
		send('project_slide', {
			direction,
			from,
			to
		});
	}

	/* ================= ENGAGEMENT ================= */

	function initEngagementTracking() {
		const events = ['mousemove', 'scroll', 'keydown', 'touchstart'];

		events.forEach(event =>
			document.addEventListener(event, registerActivity, { passive: true })
		);

		document.addEventListener('visibilitychange', handleVisibility);

		startIdleTimer();

		window.addEventListener('beforeunload', () => {
			send('user_engagement', {
				engagement_time: Math.round(engagementTime / 1000)
			});
		});
	}

	function registerActivity() {
		lastActiveTime = Date.now();

		if (isIdle) {
			isIdle = false;
		}

		startIdleTimer();
	}

	function startIdleTimer() {
		clearTimeout(idleTimer);

		idleTimer = setTimeout(() => {
			isIdle = true;
		}, IDLE_LIMIT);
	}

	function handleVisibility() {
		if (document.hidden) {
			pauseEngagement();
		} else {
			lastActiveTime = Date.now();
		}
	}

	function pauseEngagement() {
		const now = Date.now();

		if (!isIdle) {
			engagementTime += now - lastActiveTime;
		}
	}

	setInterval(() => {
		if (!isIdle && !document.hidden) {
			const now = Date.now();
			engagementTime += now - lastActiveTime;
			lastActiveTime = now;
		}
	}, 1000);

	/* ================= HELPERS ================= */

	function getDuration(start) {
		return Math.round((Date.now() - start) / 1000);
	}

	function buildThresholds() {
		const arr = [];
		for (let i = 0; i <= 1; i += 0.1) {
			arr.push(i);
		}
		return arr;
	}

	return {
		init() {
			initSectionObserver();
			initEngagementTracking();
		},
		trackProjectOpen,
		trackProjectClose,
		trackProjectSlide
	};
})();