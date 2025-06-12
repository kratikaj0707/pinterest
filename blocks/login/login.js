export default async function decorate(block) {
    const fields = [...block.querySelectorAll('p')];
    block.innerHTML = ''; // Clear block content
  
    const form = document.createElement('form');
    form.classList.add('login-form');
  
    const inputs = {};
  
    fields.forEach(field => {
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
    submitBtn.textContent = 'Login';
    form.appendChild(submitBtn);
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const body = {};
      Object.keys(inputs).forEach(key => {
        body[key] = inputs[key].value;
      });
  
      try {
        const response = await fetch('http://localhost:8000/api/auth-routes/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
  
        if (response.ok) {
            const data = await response.json(); // assuming the response contains a JSON body
            console.log(data);
            localStorage.setItem('userId',data.user.id);
            localStorage.setItem('userName', data.user.username);
            window.location.href = '/'; // redirect to homepage
        } else {
          const msg = await response.text();
          alert(`Login failed: ${msg}`);
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Something went wrong. Please try again.');
      }
    });
  
    block.appendChild(form);
  }
  