const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        nom: form.elements[0].value,
        prenom: form.elements[1].value,
        date_naissance: form.elements[2].value,
        adresse: form.elements[3].value,
        email: form.elements[4].value,
        mot_de_passe: form.elements[5].value,
        type_utilisateur: 'particulier', 
    };

    fetch('http://localhost:3000/create-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        const status = response.status;
        return response.json().then(data => {
            return { status: status, body: data }
        });
    })
    .then(data => { // à changer pour afficher un msg d'erreur ou de succès
        if (data.status === 409) {
            showPopup(data.body.message, 'error');
        } else if (data.body.message) {
            showPopup(data.body.message, 'error');
        } else {
            showPopup('Account created successfully', 'success');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    // à changer pr afficher un popup de confirmation
    function showPopup(message, type) {
        const popup = document.createElement('div');
        popup.classList.add('popup', type);
        popup.textContent = message;

        popup.style.position = 'fixed';
        popup.style.right = '20px';
        popup.style.top = '20px';

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
});
