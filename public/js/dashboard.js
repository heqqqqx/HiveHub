document.getElementById('update-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const adresse = e.target.elements.adresse.value;
    fetch('/update-address', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adresse }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Adresse mise à jour avec succès !');
        } else {
            alert('Une erreur est survenue lors de la mise à jour de l\'adresse.');
        }
    });
});

fetch('/user-ads', {
    method: 'GET',
    credentials: 'include',  // include cookies with the request
})
.then(response => response.json())
.then(data => {
    const adsList = document.getElementById('ads-list');
    data.ads.forEach(ad => {
        const div = document.createElement('div');
        div.classList.add('ad-item');
        div.textContent = ad.title;  // replace this with your ad structure
        adsList.appendChild(div);
    });
})
.catch((error) => {
    console.error('Error:', error);
});
