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
    var id = null;
    //fetch to get the id of the user thnaks to the cookie
    fetch('/session', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.message) {
                alert(data.message);
            } else {
                console.log(data);
                id = data.id_utilisateur;
            }
        });



    fetch('/create-annonce', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id, name, state, city, zipCode, address, prix, date, surface, description })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.message) {
                alert(data.message);
            } else {
                alert('Annonce created successfully!');
                console.log(data);
                // window.location.href = '/index';
            }
        });
}