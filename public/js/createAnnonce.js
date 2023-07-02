fetch('/getmydata', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            console.log("You can\'t create an annonce if you already have one");
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
                            alert(data.message);
                        } else {
                            alert('Annonce created successfully!');
                        }
                    });
                window.location.href = '/index';


            } else {
                alert("didnt worked : " + data.id_utilisateur);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });




}