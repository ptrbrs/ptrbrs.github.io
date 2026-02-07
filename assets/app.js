(function () {
	const SUPPORTED = ['en', 'es'];

	window.switchLang = function (lang) {
		if (!SUPPORTED.includes(lang)) return;

		const path = location.pathname.replace(/^\/(en|es)\//, `/${lang}/`);
		
		// GA tracking
		if (window.gtag) {
			gtag('event', 'page_view', {
				page_path: path,
				page_location: window.location.origin + path
			});
		}

		window.location.href = path;
	};
})();