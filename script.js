// Interactive behaviors: theme toggle, mobile menu, reveal-on-scroll, smooth anchors
document.addEventListener('DOMContentLoaded', function () {
	const root = document.documentElement;
	const themeToggle = document.getElementById('themeToggle');
	const menuToggle = document.getElementById('menuToggle');
	const mainNav = document.getElementById('mainNav');

	// Initialize theme from localStorage (light/dark)
	const saved = localStorage.getItem('site-theme');
	if (saved === 'light') root.classList.add('light');

	themeToggle && themeToggle.addEventListener('click', () => {
	const isLight = root.classList.toggle('light');
	localStorage.setItem('site-theme', isLight ? 'light' : 'dark');
	});

	// Mobile menu toggle
	menuToggle && menuToggle.addEventListener('click', () => {
	if (!mainNav) return;
	const shown = getComputedStyle(mainNav).display === 'flex';
	mainNav.style.display = shown ? '' : 'flex';
	mainNav.style.flexDirection = 'column';
	});

	// Reveal on scroll using IntersectionObserver
	const reveals = document.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window) {
	const obs = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
	if (entry.isIntersecting) {
		  entry.target.classList.add('visible');
		  obs.unobserve(entry.target);
	}
	});
	}, {threshold: 0.12});
	reveals.forEach(el => obs.observe(el));
	} else {
	// fallback
	reveals.forEach(el => el.classList.add('visible'));
	}

	// Smooth scrolling for anchor links on the page
	document.querySelectorAll('a[href^="#"]').forEach(a => {
	a.addEventListener('click', (e) => {
	const href = a.getAttribute('href');
	if (href.length > 1) {
	e.preventDefault();
	const target = document.querySelector(href);
	if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
	}
	});
	});

	// small friendly animation: pulse hero heading once
	const heroHeading = document.querySelector('.hero h2');
	if (heroHeading) {
	heroHeading.animate([
	{ transform: 'translateY(8px)', opacity: 0 },
	{ transform: 'translateY(0)', opacity: 1 }
	], { duration: 700, easing: 'cubic-bezier(.2,.9,.2,1)' });
	}

	// --- Fancy anchor interactions: spotlight follow and ripple on click ---
	const anchors = Array.from(document.querySelectorAll('.site a'));
	anchors.forEach(a => {
	// don't break external links: still apply effects
	a.classList.add('fancy-anchor');

	// spotlight follow
	a.addEventListener('mousemove', (e) => {
	const rect = a.getBoundingClientRect();
	const x = ((e.clientX - rect.left) / rect.width) * 100;
	const y = ((e.clientY - rect.top) / rect.height) * 100;
	a.style.setProperty('--mx', x + '%');
	a.style.setProperty('--my', y + '%');
	});
	a.addEventListener('mouseleave', () => {
	a.style.setProperty('--mx', '50%');
	a.style.setProperty('--my', '50%');
	});

	// ripple on click (or keyboard)
	const createRipple = (clientX, clientY) => {
	const rect = a.getBoundingClientRect();
	const rx = clientX - rect.left;
	const ry = clientY - rect.top;
	const span = document.createElement('span');
	span.className = 'ripple';
	span.style.left = rx + 'px';
	span.style.top = ry + 'px';
	span.style.width = span.style.height = Math.max(rect.width, rect.height) * 0.3 + 'px';
	a.appendChild(span);
	span.addEventListener('animationend', () => span.remove());
	// fallback removal
	setTimeout(() => span.remove(), 700);
	};

	a.addEventListener('click', (ev) => {
	if (ev.clientX && ev.clientY) createRipple(ev.clientX, ev.clientY);
	});

	a.addEventListener('keydown', (ev) => {
	if (ev.key === 'Enter' || ev.key === ' ') {
	// approximate center ripple for keyboard activation
	const rect = a.getBoundingClientRect();
	createRipple(rect.left + rect.width/2, rect.top + rect.height/2);
	}
	});

	// focus outline via class for consistent visual
	a.addEventListener('focus', () => a.classList.add('focused'));
	a.addEventListener('blur', () => a.classList.remove('focused'));
	});
});
