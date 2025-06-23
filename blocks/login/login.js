import { fetchPlaceholders } from '../../scripts/placeholders.js';


export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const { login } = placeholders;
  const fields = [...block.querySelectorAll('p')];
  block.innerHTML = '';

  const form = document.createElement('form');
  form.classList.add('login-form');

  const inputs = {};

  fields.forEach((field) => {
    const name = field.textContent.trim().toLowerCase();

    const label = document.createElement('label');
    label.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    label.setAttribute('for', name);

    const input = document.createElement('input');
    input.type = name === 'password' ? 'password' : 'text';
    input.name = name;
    input.id = name;
    input.required = true;

    inputs[name] = input;

    form.appendChild(label);
    form.appendChild(input);
  });

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = login;
  form.appendChild(submitBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {};
    Object.keys(inputs).forEach((key) => {
      body[key] = inputs[key].value;
    });

    try {
      const { username, password } = body; 
      const validUsername = 'admin';
      const validPassword = '1234';
    
      if (username === validUsername && password === validPassword) {
        const user = { id: 'local123', username };
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.username);
        window.location.href = '/';
      } else {
        alert('Login failed: Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong. Please try again.');
    }
    
  });

  block.appendChild(form);
}
