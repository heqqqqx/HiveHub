function sendMessage(message) {
    const urlParams = new URLSearchParams(window.location.search);
    const id_utilisateur = urlParams.get('id_utilisateur');
    const id_autre_utilisateur = urlParams.get('id_autre_utilisateur');
    console.log(id_utilisateur + "  autre:" + id_autre_utilisateur);
  
    fetch('/save-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        id_utilisateur: id_utilisateur,
        id_autre_utilisateur: id_autre_utilisateur
      })
    })
      .then(response => {
        if (response.ok) {
          console.log('Message enregistré avec succès');
        } else {
          console.error("Erreur lors de l'enregistrement du message");
        }
      })
      .catch(error => {
        console.error('Erreur lors de la requête : ' + error);
      });
  }
  
  document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault(); 
  
    const messageInput = document.querySelector('.message-input');
    const message = messageInput.value.trim();
  
    if (message) {
      sendMessage(message);
      messageInput.value = ''; 
      location.reload()
    }
  });