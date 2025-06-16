import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
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

  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    )
  );

  block.textContent = '';
  block.append(ul);

  const cardsBlock = block.closest('.cards');
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
}
