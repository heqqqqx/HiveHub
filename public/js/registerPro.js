document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nom = document.getElementById('nom').value;
    const prenom = document.getElementById('prenom').value;
    const token = document.getElementById('token').value;
    const adresse = document.getElementById('ville').value;
    const email = document.getElementById('email').value;
    const mot_de_passe = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-pwd').value;
    const date_naissance = document.getElementById('dateNaissance').value;
    

    if (mot_de_passe !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    fetch('/create-accountPro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nom,
        prenom,
        date_naissance,
        token,
        adresse,
        email,
        mot_de_passe
      })
    })
    .then(data => {
      console.log('In second .then:', data);  
  
      if (data.status === 409) {
          showPopup(data.body.message, 'error');
      } else if (data.status === 200 ) {
          showPopup('Account created successfully', 'success');
          setTimeout(() => {
              console.log('Redirecting to index.html');  
              window.location.href = '/index';
          }, 1000);
      } else if (data.body.message) {
          showPopup(data.body.message, 'error');
      }
  })
  .catch((error) => {
      console.error('Error:', error);
  });

  });
});
function getSession() {
  fetch('/session', {
    method: 'GET',
    credentials: 'include', 
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Erreur de récupération de la session');
    }
  })
  .then(data => {
    if (Object.keys(data).length === 0) {
      console.log('No user is logged in');
    } else {
      console.log('Logged in user:', data);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// Call the function
getSession();

function showPopup(message, type) {
  console.log('Showing popup:', message, type);  

  const popup = document.createElement('div');
  popup.classList.add('popup', type);
  popup.textContent = message;

  popup.style.position = 'fixed';
  popup.style.right = '20px';
  popup.style.top = '20px';
  popup.style.backgroundColor = type === 'error' ? 'red' : 'green';  
  popup.style.color = 'white';  
  popup.style.padding = '20px';  
  popup.style.borderRadius = '5px';  

  document.body.appendChild(popup);

  setTimeout(() => {
      console.log('Removing popup');  
      popup.remove();
  }, 1000);
}

