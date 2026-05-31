
document.addEventListener('DOMContentLoaded', function(){
	// set current year
	const yearEl = document.getElementById('year');
	if(yearEl) yearEl.textContent = new Date().getFullYear();

	// simple counter animation
	const counters = document.querySelectorAll('.stat-value');
	const animateCounter = (el, target) => {
		let current = 0;
		const step = Math.max(1, Math.floor(target / 100));
		const tick = () => {
			current += step;
			if(current >= target){
				el.textContent = target + (el.dataset.suffix || '');
			} else {
				el.textContent = current;
				requestAnimationFrame(tick);
			}
		};
		tick();
	};

	const statObserver = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if(entry.isIntersecting){
				const el = entry.target;
				const target = parseInt(el.dataset.target || '0', 10);
				animateCounter(el, target);
				obs.unobserve(el);
			}
		});
	}, {threshold:0.4});
	counters.forEach(c => statObserver.observe(c));

	// reveal on scroll for elements with .reveal
	const reveals = document.querySelectorAll('.reveal');
	const revealObs = new IntersectionObserver((entries) => {
		entries.forEach(e => {
			if(e.isIntersecting) e.target.classList.add('is-visible');
		});
	}, {threshold: 0.15});
	reveals.forEach(r => revealObs.observe(r));
});
