import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const { logout, searchheading } = placeholders;
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools', 'search', 'favorites', 'login'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  const navFavorites = nav.querySelector('.nav-favorites');
  const navLogin = nav.querySelector('.nav-login');
  const navSearch= nav.querySelector('.nav-search');
  const api = navSearch.querySelector('div >p').textContent;
  if (navSearch) navSearch.remove();
  const link = navFavorites.querySelector('div > p > a');

  if (link) {
    link.addEventListener('click', () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('You are not logged in. Please log in to view favourites.');
        link.href = '/login';
      }
    });
  }
  if (navLogin) {
    if (localStorage.getItem('userId')) {
      navLogin.innerHTML = '';
      const logoutBtn = document.createElement('button');
      logoutBtn.textContent = logout;

      logoutBtn.className = 'logout-btn';
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');

        window.location.reload();
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
      searchInput.id = 'search-input';

      searchWrapper.appendChild(searchInput);

      searchIconSpan.replaceWith(searchWrapper);

      let searchData = [];
      try {
        const res = await fetch(`/${api}`);
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
          .filter((item) => {
            const template = item.template?.toLowerCase();
            const title = item.title?.toLowerCase() || '';
            return template === 'search' && title.includes(query);
          });

        if (matches.length > 0) {
          suggestionsContainer.classList.add('visible');

          const heading = document.createElement('div');
          heading.textContent = searchheading;
          heading.className = 'search-heading';
          suggestionsContainer.appendChild(heading);

          matches.forEach((match) => {
            const card = document.createElement('a');
            card.href = match.path;
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

      document.addEventListener('click', (event) => {
        if (
          !searchInput.contains(event.target)
          && !suggestionsContainer.contains(event.target)
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
