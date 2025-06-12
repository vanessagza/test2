// script.js
let translations = {};
let currentLang = 'en';
let currentPage = 'home';

async function loadTranslations() {
  const [en, es] = await Promise.all([
    fetch('en.json').then(r => r.json()),
    fetch('es.json').then(r => r.json())
  ]);
  translations = { en, es };
}

function t(path) {
  return path.split('.').reduce((o, k) => o?.[k], translations[currentLang]) || '';
}

const navKeys = ['home','about','services','faq','contact'];

async function main() {
  await loadTranslations();

  // language selector
  const langSelect = document.getElementById('lang-select');
  langSelect.value = currentLang;
  langSelect.addEventListener('change', e => {
    currentLang = e.target.value;
    buildNav();
    showPage(currentPage);
  });

  buildNav();
  showPage('home');
  document.getElementById('year').textContent = new Date().getFullYear();
  // footer links
  document.querySelectorAll('.site-footer [data-page]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showPage(e.target.dataset.page);
    });
  });
}

function buildNav() {
  const navList = document.getElementById('nav-list');
  navList.innerHTML = '';
  navKeys.forEach(key => {
    const li = document.createElement('li');
    li.textContent = t(`nav.${key}`);
    li.dataset.page = key;
    navList.appendChild(li);
  });
  navList.addEventListener('click', e => {
    if (e.target.tagName === 'LI') showPage(e.target.dataset.page);
  });
  document.getElementById('logo-link').addEventListener('click', e => {
    e.preventDefault();
    showPage('home');
  });
}

function showPage(page) {
  currentPage = page;
  document.querySelectorAll('#nav-list li').forEach(li => {
    li.classList.toggle('active', li.dataset.page === page);
  });
  const main = document.getElementById('main-content');
  main.classList.remove('visible');
  setTimeout(() => {
    switch(page) {
      case 'home':    renderHome();    break;
      case 'about':   renderAbout();   break;
      case 'services':renderServices();break;
      case 'faq':     renderFAQ();     break;
      case 'contact': renderContact(); break;
      default:        renderHome();
    }
    main.classList.add('visible');
    main.focus();
  }, 100);
}

// …=== RENDER FUNCTIONS BELOW, all using t(...) and arrays from translations[currentLang]…===

function renderHome() {
  const c = translations[currentLang];
  document.getElementById('main-content').innerHTML = `
    <section class="carousel">
      <div class="slides">
        ${c.carousel.alt.map((_,i)=>`<img src="photo${i+1}.jpg" alt="${c.carousel.alt[i]}">`).join('')}
      </div>
      <button class="carousel-button prev" aria-label="Prev">&lt;</button>
      <button class="carousel-button next" aria-label="Next">&gt;</button>
    </section>
    <section>
      <h1>${t('home.aboutHeading')}</h1>
      <p>${t('home.aboutText')}</p>
    </section>
    <section>
      <h1>${t('home.servicesHeading')}</h1>
      <div class="services-grid">
        ${c.servicesList.map(s => `
          <div class="service-card">
            <h3>${s.name}</h3>
            <p>${s.description}</p>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="quote-section">
      <h1>${t('home.quoteHeading')}</h1>
      <p>${t('home.quoteText')}</p>
      <ul>${t('home.quoteList').split('|').map(item=>`<li>${item}</li>`).join('')}</ul>
    </section>
    <section class="download-section">
      <button class="pdf-btn" onclick="window.open('OmniSyn_Services_Catalogue_2025.pdf','_blank')">
        ${t('home.downloadButton')}
      </button>
    </section>
    <section class="contact-card">
      <h1>${t('home.contactHeading')}</h1>
      <p>${t('home.contactText')}</p>
      <ul>${t('home.contactList').split('|').map(item=>`<li>${item}</li>`).join('')}</ul>
    </section>
  `;
  initCarousel();
}

function initCarousel() {
  const slides = document.querySelector('.slides');
  let idx = 0, total = slides.children.length;
  document.querySelector('.prev').onclick = () => { idx=(idx-1+total)%total; slides.style.transform=`translateX(-${idx*100}%)`; };
  document.querySelector('.next').onclick = () => { idx=(idx+1)%total; slides.style.transform=`translateX(-${idx*100}%)`; };
  setInterval(()=>document.querySelector('.next').click(),5000);
}

function renderAbout(){
  document.getElementById('main-content').innerHTML = `
    <h1>${t('about.heading')}</h1>
    <p>${t('about.text')}</p>
    <h2>${t('about.missionHeading')}</h2>
    <p>${t('about.missionText')}</p>
    <h2>${t('about.visionHeading')}</h2>
    <p>${t('about.visionText')}</p>
  `;
}

function renderServices(){
  document.getElementById('main-content').innerHTML = `
    <h1>${t('servicesPage.heading')}</h1>
    <input id="service-search" class="service-search" type="text" placeholder="${t('servicesPage.searchPlaceholder')}" aria-label="${t('servicesPage.searchPlaceholder')}">
    <div id="services-grid" class="services-grid"></div>
  `;
  const grid = document.getElementById('services-grid');
  const list = translations[currentLang].servicesList;
  function populate(filter=''){
    grid.innerHTML = '';
    list.filter(s=>s.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(s=>{
          const div=document.createElement('div'); div.className='service-card';
          div.innerHTML=`<h3>${s.name}</h3><p>${s.description}</p>`;
          grid.appendChild(div);
        });
  }
  populate();
  document.getElementById('service-search')
          .addEventListener('input', e=>populate(e.target.value));
}

function renderFAQ(){
  const items = translations[currentLang].faqPage.items;
  document.getElementById('main-content').innerHTML = `
    <h1>${t('faqPage.heading')}</h1>
    ${items.map(i=>`<div class="faq-item"><h3>${i.q}</h3><p>${i.a}</p></div>`).join('')}
  `;
}

function renderContact(){
  const c = translations[currentLang].home;
  document.getElementById('main-content').innerHTML = `
    <div class="contact-card">
      <h1>${c.contactHeading}</h1>
      <p>${c.contactText}</p>
      <ul>${c.contactList.map(item=>`<li>${item}</li>`).join('')}</ul>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', main);
