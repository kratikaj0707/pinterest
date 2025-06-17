import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const isLoggedIn = localStorage.getItem('userName') !== null;
  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools', 'favorites', 'login'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  const navFavorites = nav.querySelector(".nav-favorites");
  const navLogin = nav.querySelector('.nav-login');


  const link = navFavorites.querySelector('div > p > a');

  if (link) {
    link.addEventListener('click', (e) => {
      const userId = localStorage.getItem('userId');
      if (!userId) {

        alert("You are not logged in. Please log in to view favourites.");
        link.href = "/login";

      }
    });
  }
  if (navLogin) {

    if (localStorage.getItem('userId')) {
      navLogin.innerHTML = ''; // Clear any existing content

      // User is logged in – show logout button
      const logoutBtn = document.createElement('button');
      logoutBtn.textContent = 'Log out';

      logoutBtn.className = 'logout-btn';
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userId')
        localStorage.removeItem('userName');


        window.location.reload(); // Reload page or redirect to login
      });
      navLogin.appendChild(logoutBtn);
    }
  }


  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const searchIconSpan = navTools.querySelector('.icon-search');
    console.log(searchIconSpan);
    if (searchIconSpan) {
      
      const searchWrapper = document.createElement('div');
      searchWrapper.className = 'nav-search-wrapper';

      
      searchWrapper.appendChild(searchIconSpan.cloneNode(true));

      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search for easy dinner, fashion, etc.';
      searchInput.className = 'nav-search-input';
      searchInput.id = "search-input";
      
      searchWrapper.appendChild(searchInput);

      searchIconSpan.replaceWith(searchWrapper);
      
      let searchData = [];
      try {
        const res = await fetch('/query-index.json');
        const data = await res.json();
        searchData = Array.isArray(data?.data) ? data.data : [];
      } catch (err) {
        console.error('Failed to load search index:', err);
      }

      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'search-suggestions-container';
      searchWrapper.appendChild(suggestionsContainer);

      
      const renderSuggestions = (query = '') => {
        suggestionsContainer.innerHTML = '';
      
        const matches = searchData
          .filter(item => {
            const template = item.template?.toLowerCase();
            const title = item.title?.toLowerCase() || '';
            return template === 'search' && title.includes(query);
          });
      
        if (matches.length > 0) {
          suggestionsContainer.classList.add('visible');
      
          // Add heading
          const heading = document.createElement('div');
          heading.textContent = 'Popular on Pinterest';
          heading.style.fontWeight = '600';
          heading.style.fontSize = '16px';
          heading.style.margin = '12px';
          heading.style.gridColumn = '1 / -1'; // span full width
          suggestionsContainer.appendChild(heading);
      
          // Add cards
          matches.forEach(match => {
            const card = document.createElement('a');
            card.href =  match.path;
            card.className = 'search-card';
      
            const img = document.createElement('img');
            img.src = match.image || '/default-image.jpg';
            img.alt = match.title || 'Result';
      
            const titleEl = document.createElement('p');
            titleEl.textContent = match.title || 'Untitled';
      
            card.appendChild(img);
            card.appendChild(titleEl);
            suggestionsContainer.appendChild(card);
          });
        } else {
          suggestionsContainer.classList.remove('visible');
        }
      };
      

      
      
      searchInput.addEventListener('focus', () => {
        renderSuggestions(); 
      });

      
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        renderSuggestions(query);
      });

      
      document.addEventListener('click', function (event) {
        
        if (
          !searchInput.contains(event.target) &&
          !suggestionsContainer.contains(event.target)
        ) {
          suggestionsContainer.classList.remove('visible');
        }
      });
      
    }

  }


  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
