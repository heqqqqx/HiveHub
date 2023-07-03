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
    .then(response => {
      if (response.ok) {
        alert('Compte créé avec succès.');
        return getSession()
      } else {
        response.json().then(data => {
          alert(data.message);
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Une erreur s\'est produite lors de la création du compte.');
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

