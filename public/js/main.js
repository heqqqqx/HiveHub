fetch('/session', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.id_utilisateur) {
            document.getElementById('logout').style.display = 'block';
            document.getElementById('client-space-href').href = '/dashboard';
            console.log('User is logged in:', data);

            if (data.type_utilisateur === 'banquier') {
                document.querySelector('#nav-items ul li:nth-child(3) a').textContent = 'Voir les annonces';
                document.querySelector('#nav-items ul li:nth-child(3) a').href = '/annonces';
                document.getElementById('client-space-href').textContent = 'Espace pro';

                const cadenasIcon = document.createElement('img');
                cadenasIcon.src = '../image/icon/cadenas.png';
                cadenasIcon.alt = 'Cadenas';
                cadenasIcon.className = 'cadenas-icon';
                document.getElementById('client-space-href').prepend(cadenasIcon);

            }
        } else {
            document.getElementById('logout').style.display = 'none';
            document.getElementById('client-space-href').href = '/register';
            console.log('User is not logged in');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });


function logout() {
    fetch('/logout', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.message) {
                alert(data.message);
            } else {
                alert('You have been logged out successfully!');
            }
        });
    window.location.href = '/index';
}