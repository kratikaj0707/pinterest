import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

const config = await fetch('/config.json').then((res) => res.json());
const { apiBaseUrl } = config;
export async function applySeeMorePagination(ul, block, itemsPerRow = 3) {
  const placeholders = await fetchPlaceholders();
  const { buttontext } = placeholders;
  const listItems = Array.from(ul.querySelectorAll('li'));
  listItems.forEach((li, index) => {
    if (index >= itemsPerRow) {
      li.style.display = 'none';
    }
  });
  const button = document.createElement('button');
  button.textContent = buttontext;
  button.className = 'cards-show-more';
  let currentIndex = itemsPerRow;
  button.addEventListener('click', () => {
    const nextIndex = currentIndex + itemsPerRow;
    listItems.slice(currentIndex, nextIndex).forEach((li) => {
      li.style.display = '';
    });
    currentIndex = nextIndex;

    if (currentIndex >= listItems.length) {
      button.remove();
    }
  });
  block.append(button);
}
async function addFavorite(payload) {
  const res = await fetch(`${apiBaseUrl}/favorite-routes/save-favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save favorite');
}
async function removeFavorite(userId, image) {
  const res = await fetch(`${apiBaseUrl}/favorite-routes/delete-favorites`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, image }),
  });
  if (!res.ok) throw new Error('Failed to remove favorite');
}
export default async function decorate(block) {
  const ul = document.createElement('ul');
  const cardsBlock = block.closest('.cards');
  const userId = localStorage.getItem('userId');
  let userFavorites = [];

  if (cardsBlock?.classList.contains('square') || cardsBlock?.classList.contains('rectangle')) {
    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-card-image';
        } else {
          div.className = 'cards-card-body';
        }
      });
      ul.append(li);
    });
    ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));
    block.textContent = '';
    block.append(ul);
    if (cardsBlock?.classList.contains('square')) {
      applySeeMorePagination(ul, block, 3);
    }
    if (cardsBlock?.classList.contains('rectangle')) {
      applySeeMorePagination(ul, block, 5);
    }
  }

  if (cardsBlock?.classList.contains('row')) {
    [...block.children].forEach((row) => {
      const isRowLayout = cardsBlock?.classList.contains('row');
      const li = document.createElement('li');
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) {
          div.className = 'cards-card-image';
        } else {
          div.className = 'cards-card-body';
          if (isRowLayout) {
            const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`;
            div.style.backgroundColor = randomColor;
          }
        }
      });
      ul.append(li);
    });
    ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));

    block.textContent = '';
    block.append(ul);
  }

  if (cardsBlock?.classList.contains('uneven')) {
    if (userId) {
      try {
        const res = await fetch(`${apiBaseUrl}/favorite-routes/get-favorites/${userId}`);
        const data = await res.json();

        if (Array.isArray(data)) userFavorites = data;
      } catch (err) {
        console.error('Failed to fetch user favorites:', err);
      }
    }
    const renderFromFavorites = cardsBlock.classList.contains('dynamic');
    const rows = renderFromFavorites
      ? userFavorites.map((fav) => {
        const li = document.createElement('li');
        li.style.position = 'relative';
        const imgDiv = document.createElement('div');
        imgDiv.className = 'cards-card-image';
        const pic = createOptimizedPicture(fav.image, fav.title || '', false, [{ width: '750' }]);
        imgDiv.appendChild(pic);
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'cards-card-body';
        const h4 = document.createElement('h4');
        h4.textContent = fav.title || '';
        const p = document.createElement('p');
        p.textContent = fav.description || '';
        const tagList = document.createElement('ul');
        (fav.tags || []).forEach((tag) => {
          const tagLi = document.createElement('li');
          tagLi.textContent = tag;
          tagList.appendChild(tagLi);
        });
        bodyDiv.appendChild(tagList);
        bodyDiv.appendChild(h4);
        bodyDiv.appendChild(p);
        li.appendChild(imgDiv);
        li.appendChild(bodyDiv);
        return li;
      })
      : [...block.children].map((row) => {
        const li = document.createElement('li');
        while (row.firstElementChild) li.append(row.firstElementChild);
        [...li.children].forEach((div) => {
          if (div.children.length === 1 && div.querySelector('picture')) {
            div.className = 'cards-card-image';
          } else {
            div.className = 'cards-card-body';
          }
        });
        return li;
      });
    rows.forEach((li) => {
      const imageSrc = li.querySelector('picture img')?.src || '';
      let isFavorite = userFavorites.some((fav) => fav.image === imageSrc);
      const heartIcon = document.createElement('div');
      heartIcon.className = 'favorite-icon';
      if (isFavorite) heartIcon.classList.add('is-favorite');
      li.style.position = 'relative';
      li.appendChild(heartIcon);
      heartIcon.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!userId) {
          alert('Please log in to save favorites.');
          return;
        }
        const card = e.target.closest('li');
        const image = card.querySelector('picture img')?.src || '';
        const tags = Array.from(card.querySelectorAll('.cards-card-body ul li')).map((list) => list.textContent.trim());
        const title = card.querySelector('h4')?.textContent.trim() || '';
        const description = card.querySelector('p')?.textContent.trim() || '';
        const payload = {
          userId, image, tags, title, description,
        };
        try {
          if (isFavorite) {
            await removeFavorite(userId, image);

            heartIcon.classList.remove('is-favorite');
            isFavorite = false;
            if (renderFromFavorites) {
              li.remove();
            }
          } else {
            await addFavorite(payload);
            heartIcon.classList.add('is-favorite');

            isFavorite = true;
          }
        } catch (err) {
          alert('Something went wrong. Please try again.');
        }
      });

      ul.appendChild(li);
    });
    ul.querySelectorAll('picture > img').forEach((img) => {
      const picture = img.closest('picture');
      if (picture) {
        picture.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
      }
    });

    block.textContent = '';
    block.appendChild(ul);
  }
}
