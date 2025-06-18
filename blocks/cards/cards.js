import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const ul = document.createElement('ul');
  const cardsBlock = block.closest('.cards');
  const userId = localStorage.getItem('userId');
  let userFavorites = [];
  if (userId) {
    try {
      const res = await fetch(`http://localhost:8000/api/favorite-routes/get-favorites/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) userFavorites = data;
    } catch (err) {
      console.error('Failed to fetch user favorites:', err);
    }
  } let colorIndex = 0;
  [...block.children].forEach((row) => {

    const bgColors = ['#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4', '#D1C4E9'];
    const isRowLayout = cardsBlock?.classList.contains('row');

    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';

        // ✅ Only apply background color if .row is present
        if (isRowLayout) {

          div.style.backgroundColor = bgColors[colorIndex % bgColors.length];
          colorIndex++;
        }
      }

    });
    if (cardsBlock?.classList.contains('uneven')) {
      const imageSrc = li.querySelector('picture img')?.src || '';
      let isFavorite = userFavorites.some(fav => fav.image === imageSrc);

      const heartIcon = document.createElement('img');
      heartIcon.src = isFavorite ? '/icons/heart-icon.svg' : '/icons/white-heart.svg';
      heartIcon.alt = 'favorite';
      heartIcon.style.position = 'absolute';
      heartIcon.style.top = '8px';
      heartIcon.style.right = '8px';
      heartIcon.style.width = '24px';
      heartIcon.style.height = '24px';
      heartIcon.style.zIndex = '10';
      heartIcon.style.cursor = 'pointer';

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
        const tags = Array.from(card.querySelectorAll('.cards-card-body ul li')).map(li => li.textContent.trim());
        const title = card.querySelector('h4')?.textContent.trim() || '';
        const description = card.querySelector('p')?.textContent.trim() || '';
        const payload = { userId, image, tags, title, description };

        try {
          if (isFavorite) {
            // Remove from favorites
            const res = await fetch('http://localhost:8000/api/favorite-routes/delete-favorites', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, image }),
            });

            if (!res.ok) throw new Error('Failed to remove favorite');

            heartIcon.src = '/icons/white-heart.svg';
            isFavorite = false;
          } else {
            // Add to favorites
            const res = await fetch('http://localhost:8000/api/favorite-routes/save-favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save favorite');

            heartIcon.src = '/icons/heart-icon.svg';
            isFavorite = true;
          }
        } catch (err) {
          console.error('Favorite toggle failed:', err);
          alert('Something went wrong. Please try again.');
        }
      });
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    )
  );

  block.textContent = '';
  block.append(ul);


  if (cardsBlock?.classList.contains('square')) {
    const listItems = Array.from(ul.querySelectorAll('li'));
    const itemsPerRow = 3; // Number of cards per row (adjust as needed)

    // Initially hide all except the first row
    listItems.forEach((li, index) => {
      if (index >= itemsPerRow) {
        li.style.display = 'none';
      }
    });

    const button = document.createElement('button');
    button.textContent = 'See more';
    button.className = 'cards-show-more';
    button.style.margin = '16px auto';
    button.style.display = 'block';

    let currentIndex = itemsPerRow;

    button.addEventListener('click', () => {
      const nextIndex = currentIndex + itemsPerRow;
      listItems.slice(currentIndex, nextIndex).forEach((li) => {
        li.style.display = '';
      });
      currentIndex = nextIndex;

      if (currentIndex >= listItems.length) {
        button.remove(); // All cards shown
      }
    });

    block.append(button);
  }
  if (cardsBlock?.classList.contains('rectangle')) {
    const listItems = Array.from(ul.querySelectorAll('li'));
    const itemsPerRow = 5; // Number of cards per row (adjust as needed)

    // Initially hide all except the first row
    listItems.forEach((li, index) => {
      if (index >= itemsPerRow) {
        li.style.display = 'none';
      }
    });

    const button = document.createElement('button');
    button.textContent = 'See more';
    button.className = 'cards-show-more';
    button.style.margin = '16px auto';
    button.style.display = 'block';

    let currentIndex = itemsPerRow;

    button.addEventListener('click', () => {
      const nextIndex = currentIndex + itemsPerRow;
      listItems.slice(currentIndex, nextIndex).forEach((li) => {
        li.style.display = '';
      });
      currentIndex = nextIndex;

      if (currentIndex >= listItems.length) {
        button.remove(); // All cards shown
      }
    });

    block.append(button);
  }
  if (cardsBlock?.classList.contains('favorites')) {
    cardsBlock.classList.add('uneven');
    if (!userId) {
      const heading = document.createElement('p');
      heading.innerHTML = "You are not logged in. Please log in to view favourites.";
      heading.classList.add('no-favorites-message');

      block.classList.add('no-favorites-container');
      block.innerHTML = ''; // Clear any existing content
      block.append(heading);
      heading.style.margin = "16px auto"
      block.append(heading);

      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/favorite-routes/get-favorites/${userId}`);
      const favorites = await res.json();

      if (!Array.isArray(favorites) || favorites.length === 0) {
        const mainBlock = document.querySelector(".favoriteblock");
        const head = mainBlock.querySelector("main >div >div >h1");
        head.style.display = "none";
        const heading = document.createElement('h1');
        heading.innerHTML = "No favorites found!";
        heading.className = "noFavorites";

        block.append(heading);

        return;
      }

      const ul = document.createElement('ul');

      favorites.forEach((fav) => {
        const li = document.createElement('li');
        li.style.position = 'relative';

        // Image
        const imgDiv = document.createElement('div');
        imgDiv.className = 'cards-card-image';
        const pic = createOptimizedPicture(fav.image, fav.title || '', false, [{ width: '750' }]);
        imgDiv.appendChild(pic);

        // Body
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'cards-card-body';
        const h4 = document.createElement('h4');
        h4.textContent = fav.title || '';
        const p = document.createElement('p');
        p.textContent = fav.description || '';
        const tagList = document.createElement('ul');
        (fav.tags || []).forEach(tag => {
          const tagLi = document.createElement('li');
          tagLi.textContent = tag;
          tagList.appendChild(tagLi);
        });
        bodyDiv.appendChild(tagList);
        bodyDiv.appendChild(h4);
        bodyDiv.appendChild(p);


        // Heart Icon (remove favorite)
        const heartIcon = document.createElement('img');
        heartIcon.src = '/icons/heart-icon.svg';
        heartIcon.alt = 'Remove favorite';
        heartIcon.style.position = 'absolute';
        heartIcon.style.top = '8px';
        heartIcon.style.right = '8px';
        heartIcon.style.width = '24px';
        heartIcon.style.height = '24px';
        heartIcon.style.zIndex = '10';
        heartIcon.style.cursor = 'pointer';

        heartIcon.addEventListener('click', async (e) => {
          e.stopPropagation();

          try {
            const res = await fetch('http://localhost:8000/api/favorite-routes/delete-favorites', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, image: fav.image }),
            });

            if (!res.ok) throw new Error('Failed to remove favorite');

            li.remove(); // Remove the card from the UI
          } catch (err) {
            console.error('Error removing favorite:', err);
            alert('Failed to remove favorite');
          }
        });

        li.appendChild(imgDiv);
        li.appendChild(bodyDiv);
        li.appendChild(heartIcon);

        ul.appendChild(li);
      });

      block.textContent = '';
      block.appendChild(ul);
      return; // Skip rest of function for favorites block

    } catch (err) {
      console.error('Failed to load favorites:', err);
      block.innerHTML = '<p>Error loading favorites.</p>';
      return;
    }
  }

}
