fetch('/session', {
        method: 'GET',
        credentials: 'include' // include cookies with the request
    })
    .then(response => response.json())
    .then(data => {
        if (data.id_utilisateur) {
            document.getElementById('logout').style.display = 'block';
            document.getElementById('client-space-href').href = '/dashboard';
            console.log('User is logged in:', data);
        } else {
            document.getElementById('logout').style.display = 'none';
            document.getElementById('client-space-href').href = '/register';
            console.log('User is not logged in');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });