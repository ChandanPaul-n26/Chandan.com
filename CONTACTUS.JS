// Contact page interactions: validation, toast, simple UX
document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('contactForm');
	const toast = document.getElementById('toast');

	function showToast(message, timeout = 3200){
		toast.textContent = message;
		toast.classList.add('visible');
		clearTimeout(toast._t);
		toast._t = setTimeout(()=> toast.classList.remove('visible'), timeout);
	}

	function setError(name, message){
		const el = document.querySelector(`.error[data-for="${name}"]`);
		if(el) el.textContent = message || '';
	}

	function validate(){
		let ok = true;
		const name = form.name.value.trim();
		const email = form.email.value.trim();
		const message = form.message.value.trim();

		setError('name',''); setError('email',''); setError('message','');

		if(!name){ setError('name','Please enter your name'); ok = false; }
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if(!email || !emailRe.test(email)){ setError('email','Enter a valid email'); ok = false; }
		if(!message || message.length < 8){ setError('message','Type at least 8 characters'); ok = false; }

		return ok;
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		if(!validate()){
			showToast('Please fix errors and try again');
			return;
		}

		// Simulate sending
		const btn = form.querySelector('button[type="submit"]');
		btn.disabled = true; btn.textContent = 'Sending...';
		setTimeout(()=>{
			btn.disabled = false; btn.textContent = 'Send message';
			form.reset();
			showToast('Thanks — your message has been sent!');
		}, 900);
	});

	// Floating label helpers: mark inputs that have content so label moves
	form.querySelectorAll('input,textarea').forEach(el => {
		const check = () => {
			if(el.value) el.classList.add('has-val'); else el.classList.remove('has-val');
		};
		el.addEventListener('input', check);
		// initial
		check();
	});
});

