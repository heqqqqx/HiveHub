window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOMContentLoaded event fired");

    // Fetch current session data from server
    fetch('/session', {
        method: 'GET',
        credentials: 'same-origin',  // Include cookies in request
    })
    .then(response => {
        console.log("Response received:", response);
        return response.json();
    })
    .then(sessionData => {
        console.log("Session data:", sessionData.id_utilisateur);

        const navItems = document.querySelector('#nav-items ul');
        const clientSpace = document.getElementById('client-space');

        if (navItems && clientSpace) {
            console.log("Elements found: navItems and clientSpace");

            // If user is logged in
            if (sessionData.id_utilisateur) {
                console.log("User is logged in");

                // Create welcome message
                const welcomeMessage = document.createElement('li');
                welcomeMessage.textContent = `Welcome, ${sessionData.nom}!`;

                // Create logout button
                const logoutButton = document.createElement('li');
                const logoutLink = document.createElement('a');

                fetch('/logout', {
                    method: 'GET',
                    credentials: 'same-origin',  
                })
                logoutLink.href = '../html/index.html';
                logoutLink.textContent = 'Déconnexion';
                logoutButton.appendChild(logoutLink);

                // Append new elements to nav items
                navItems.appendChild(welcomeMessage);
                navItems.appendChild(logoutButton);
            }
        } else {
            console.log("Elements not found: navItems or clientSpace");
        }
    })
    .catch(error => console.error('Error:', error));
});
