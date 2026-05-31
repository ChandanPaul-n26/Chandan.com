document.addEventListener('DOMContentLoaded', function() {
  const search = document.getElementById('search');
  const clearBtn = document.getElementById('clearSearch');
  const faqList = document.getElementById('faqList');
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  const copyEmail = document.getElementById('copyEmail');
  const contactForm = document.getElementById('contactForm');
  const saveLocal = document.getElementById('saveLocal');
  const formMessage = document.getElementById('formMessage');

  // Debounce helper
  function debounce(fn, wait=150){let t;return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),wait)}}

  function filterFaq(query){
    const q = String(query||'').trim().toLowerCase();
    faqItems.forEach(item=>{
      const question = item.querySelector('.question').textContent.toLowerCase();
      const answer = item.querySelector('.answer').textContent.toLowerCase();
      const tags = (item.dataset.tags||'').toLowerCase();
      const match = !q || question.includes(q) || answer.includes(q) || tags.includes(q);
      item.style.display = match ? '' : 'none';
    });
  }

  search.addEventListener('input', debounce(e=>filterFaq(e.target.value),120));
  clearBtn.addEventListener('click', ()=>{search.value='';search.focus();filterFaq('');});

  // Accordion behavior
  faqList.addEventListener('click', e=>{
    const item = e.target.closest('.faq-item');
    if(!item) return;
    item.classList.toggle('open');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e=>{
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'){
      if(e.key === 'Escape') e.target.blur();
      return; // let form inputs behave normally
    }
    if(e.key === '/'){
      e.preventDefault(); search.focus(); return;
    }
    if(e.key === '?'){
      e.preventDefault();
      const el = document.getElementById('shortcuts');
      if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.background = 'rgba(0,120,212,0.03)'; setTimeout(()=>el.style.background='transparent',800); }
    }
    if(e.key === 'Escape'){
      search.value=''; filterFaq('');
    }
  });

  // Copy support email
  copyEmail.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(copyEmail.textContent.trim());
      copyEmail.textContent = 'Copied!';
      setTimeout(()=>copyEmail.textContent = 'support@example.com',1500);
    }catch(err){
      alert('Copy failed. Email: '+copyEmail.textContent);
    }
  });

  // Contact form handling (no backend) — provide local save / validation
  contactForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    if(!name||!email||!message){ formMessage.textContent='Please fill all fields.'; formMessage.style.color='crimson'; return; }
    // simulate send
    formMessage.style.color='green';
    formMessage.textContent = 'Thanks — your message has been saved locally. (No server configured)';
    const stored = JSON.parse(localStorage.getItem('help_feedback')||'[]');
    stored.push({name,email,message,ts:Date.now()});
    localStorage.setItem('help_feedback', JSON.stringify(stored));
    contactForm.reset();
    setTimeout(()=>formMessage.textContent='',4000);
  });

  saveLocal.addEventListener('click', ()=>{
    const payload = {name:contactForm.name.value,email:contactForm.email.value,message:contactForm.message.value,ts:Date.now()};
    const stored = JSON.parse(localStorage.getItem('help_feedback')||'[]');
    stored.push(payload); localStorage.setItem('help_feedback', JSON.stringify(stored));
    formMessage.style.color='green'; formMessage.textContent='Saved locally.'; setTimeout(()=>formMessage.textContent='',2000);
  });

  // Initialize
  filterFaq('');
});
