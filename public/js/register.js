const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();


        // vérification des mots de passe
        const password = form.elements['mot_de_passe'].value;
        const confirmPassword = document.getElementById('confirm-pwd').value;
    
        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;  // Terminez tôt pour ne pas envoyer la requête fetch
        }

    const formData = {
        nom: form.elements[0].value,
        prenom: form.elements[1].value,
        date_naissance: form.elements[2].value,
        adresse: form.elements[3].value,
        email: form.elements[4].value,
        mot_de_passe: form.elements[5].value,
        type_utilisateur: 'particulier', 
    };

    fetch('/create-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        console.log('Response status:', response.status);  
        console.log('Response headers:', response.headers);  
        return response.text().then(text => {
            try {

                const data = JSON.parse(text);
                console.log('Parsed response data:', data);  
                return { status: response.status, body: data };
            } catch (error) {
                
                console.log('Raw response text:', text);  
                throw error;
            }
        });
    })
    .then(data => {
        console.log('In second .then:', data);  
    
        if (data.status === 409) {
            showPopup(data.body.message, 'error');
        } else if (data.status === 200 && data.body.message === 'Account created successfully') {
            showPopup('Account created successfully', 'success');
            setTimeout(() => {
                console.log('Redirecting to index.html');  
                window.location.href = 'index.html';
            }, 1000);
        } else if (data.body.message) {
            showPopup(data.body.message, 'error');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    
    
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
    
})
