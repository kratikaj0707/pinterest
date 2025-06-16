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

  const classes = ['brand', 'sections', 'tools','favorites','login'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  const navLogin = nav.querySelector('.nav-login');
  if (navLogin) {
    
    if (localStorage.getItem('userName')) {
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
      // Create a wrapper
      const searchWrapper = document.createElement('div');
      searchWrapper.className = 'nav-search-wrapper';
  
      // Move the existing icon into wrapper
      searchWrapper.appendChild(searchIconSpan.cloneNode(true));
  
      // Create the search input
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search for easy dinner, fashion, etc.';
      searchInput.className = 'nav-search-input';
      searchInput.id="search-input";
      // Add input to wrapper
      searchWrapper.appendChild(searchInput);
  
      // Replace the icon with the new wrapper
      searchIconSpan.replaceWith(searchWrapper);
    }
  }
  

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
