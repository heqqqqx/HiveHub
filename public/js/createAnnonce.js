fetch('/getmydata', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.length != 0) {
            console.log("You can't create an annonce if you already have one");
            window.location.href = '/dashboard';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });


function addAnnonce() {
    var name = document.getElementById("title").value;
    var state = document.getElementById("state").value;
    var city = document.getElementById("city").value;
    var zipCode = document.getElementById("zipCode").value;
    var address = document.getElementById("address").value;
    var prix = document.getElementById("price").value;
    var surface = document.getElementById("surface").value;
    var description = document.getElementById("description").value;

    var date = null;

    fetch('/session', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.id_utilisateur) {
                console.log(data);
                console.log("data.idutilisateur : " + data.id_utilisateur);
                var id_utilisateur = data.id_utilisateur;

                fetch('/create-annonce', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, id_utilisateur, state, city, zipCode, address, prix, date, surface, description })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.message) {
                            showPopup(data.message, 'success');
                            setTimeout(() => {
                                console.log('Redirecting to index.html');
                                window.location.href = '/index';
                            }, 1000);
                        } else {
                            showPopup('error', 'error');
                            setTimeout(() => {
                                console.log('Redirecting to index.html');
                                window.location.href = '/index';
                            }, 1000);
                        }
                    });



            } else {
                showPopup('Erreur', 'error');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });




}

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