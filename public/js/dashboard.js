let userType = "";
let varbanquierId = 0;

fetch('http://localhost:3000/session')
    .then(response => response.json())
    .then(data => {
        console.log('User is logged in:', data);
        varbanquierId = data.id_utilisateur;
        userType = data.type_utilisateur;

        if (userType === 'banquier') {
            fetch(`http://localhost:3000/annonces-interessees/${varbanquierId}`)
                .then(response => response.json())
                .then(data => {
                    const annoncesList = document.querySelector('.jobsearch-ResultsList');
                    const rightDisplay = document.querySelector('.attributs_demande');
                    const rightPanel = document.querySelector('.annonces-ViewAnnoncePaneWrapper');

                    rightPanel.classList.add('hidden');

                    annoncesList.innerHTML = '';
                    rightDisplay.innerHTML = '';

                    data.forEach((annonce, index) => {
                        const annonceElement = document.createElement('li');
                        let rawDate = new Date(annonce.date_annonce);
                        let formattedDate = ("0" + rawDate.getDate()).slice(-2) + "/" + ("0" + (rawDate.getMonth() + 1)).slice(-2) + "/" + rawDate.getFullYear();

                        annonceElement.innerHTML = `
                            <div class="slider_container">
                                <table class="jobCard_mainContent" cellpadding="0" cellspacing="0" role="presentation">
                                    <tbody>
                                        <tr>
                                            <td class="resultContent">
                                                <div>
                                                    <h2 class="title">${annonce.titre_annonce}</h2>
                                                </div>
                                                <div class="infosGenerales">
                                                    <div class="date_annonce">${formattedDate}</div>
                                                    <div class="state">${annonce.state}</div>
                                                </div>
                                                <button class="view-more" data-index="${index}">Voir plus</button>
                                                <button class="remove" data-index="${index}">Supprimer l'annonce des favoris</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        `;

                        annoncesList.appendChild(annonceElement);
                    });

                    document.querySelectorAll('.remove').forEach((btn) => {
                        btn.addEventListener('click', (event) => {
                            const annonceId = data[event.target.dataset.index].id_annonce;
                            fetch(`http://localhost:3000/annonces-interessees`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    id_banquier: varbanquierId,
                                    id_annonce: annonceId
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    showPopup("Annonce supprimée des favoris", "error");
                                    setTimeout(() => {
                                        window.location.href = '/dashboard';
                                    }, 1000);
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                });
                        });
                    });

                    document.querySelectorAll('.view-more').forEach((btn) => {
                        btn.addEventListener('click', (event) => {
                            const btnText = event.target.innerText;
                            if (btnText === "Voir plus") {
                                event.target.innerText = "Voir moins";
                                const annonce = data[event.target.dataset.index];
                                console.log(annonce)
                                const rightElement = document.createElement('div');

                                rightElement.innerHTML = `
                                    <div class="attribut">
                                        <span class="attribut_label"><h3>Prix du bien:</h3></span>
                                        <div class="editable-value" data-field="prix_bien" data-type="annonce">${annonce.prix_bien}</div>
                                        </div>
                                    <div class="attribut">
                                        <span class="attribut_label"><h3>Surface:</h3></span>
                                        <div class="editable-value" data-field="surface" data-type="annonce">${annonce.surface}</div>
                                        </div>
                                    <div class="attribut">
                                        <span class="attribut_label"><h3>Descriptions:</h3></span>
                                        <div class="editable-value" data-field="descriptions" data-type="annonce">${annonce.descriptions}</div>
                                        </div>
                                    <div class="attribut">
                                        <span class="attribut_label"><h3>Adresse:</h3></span>
                                        <div class="editable-value" data-field="address" data-type="annonce">${annonce.address}</div>
                                        </div>
                                    <div class="attribut">
                                        <span class="attribut_label"><h3>Code postal:</h3></span>
                                        <div class="editable-value" data-field="postal_code" data-type="annonce">${annonce.zip_code}</div>
                                         </div>
                                    <div class="attribut">
                                        <span class="attribut_label"><h3>Ville:</h3></span>
                                        <div class="editable-value" data-field="city" data-type="annonce">${annonce.city}</div>
                                        </div>
                                    <button class="message-button" type="button">Voir message</button>
                                    <button class="download" data-annonce-id="${annonce.id_annonce}">Télécharger les fichiers</button>
                                    `;

                                    console.log(annonce.id_annonce);
                                    rightElement.querySelector(".download").addEventListener("click", (event) => downloadFiles(event, data));
                                    rightDisplay.innerHTML = '';
                                rightDisplay.appendChild(rightElement);
                                rightPanel.classList.remove('hidden');
                                rightElement.querySelectorAll('.message-button').forEach((messageButton) => {
                                    messageButton.addEventListener('click', () => {
                                        const annonceId = data[event.target.dataset.index].id_annonce;
                                        let id_utilisateur = 0;
                                        console.log("Fetching ID utilisateur");
                                        fetch(`/get-userId/${annonceId}`, {
                                            method: 'GET',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            }
                                        })
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.id_utilisateur) {
                                                id_utilisateur = data.id_utilisateur;
                                                console.log("id_utilisateur:", id_utilisateur);
                                                window.location.href = `/messages?id_utilisateur=${varbanquierId}&id_autre_utilisateur=${id_utilisateur}`;
                                            } else {
                                                console.log("Erreur lors de la récupération de l'id utilisateur");
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
                                        });
                                    });
                                });
                                




                                rightElement.querySelectorAll('.edit-button').forEach((editButton) => {
                                    const editableValue = editButton.parentNode.querySelector('.editable-value');
                                    const saveButton = editButton.parentNode.querySelector('.save-button');

                                    editButton.addEventListener('click', () => {
                                        const textarea = document.createElement('textarea');
                                        textarea.value = editableValue.innerText;

                                        editableValue.innerHTML = '';
                                        editableValue.appendChild(textarea);

                                        saveButton.style.display = 'block';
                                        editButton.style.display = 'none';
                                    });

                                    saveButton.addEventListener('click', () => {
                                        const fieldValue = editableValue.getAttribute('data-field');
                                        const fieldType = editableValue.getAttribute('data-type');
                                        const newValue = editableValue.parentNode.querySelector('textarea').value;
                                        editableValue.innerText = newValue;
                                        saveButton.style.display = 'none';
                                        editButton.style.display = 'block';

                                        const annonceId = data[event.target.dataset.index].id_annonce;
                                        fetch(`/update-annonce/${fieldValue}/${annonceId}`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                field: fieldValue,
                                                value: newValue
                                            })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                console.log('Annonce mise à jour:', data);
                                            })
                                            .catch(error => {
                                                console.error('Erreur lors de la mise à jour de l\'annonce:', error);
                                            });
                                    });
                                });
                            } else {
                                event.target.innerText = "Voir plus";
                                rightDisplay.innerHTML = '';
                                rightPanel.classList.add('hidden');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('Erreur:', error);
                });
        } else {
            fetch('http://localhost:3000/getmydata')
                .then(response => response.json())
                .then(data => {
                    const annoncesList = document.querySelector('.jobsearch-ResultsList');
                    const rightDisplay = document.querySelector('.attributs_demande');
                    const rightPanel = document.querySelector('.annonces-ViewAnnoncePaneWrapper');

                    rightPanel.classList.add('hidden');

                    annoncesList.innerHTML = '';
                    rightDisplay.innerHTML = '';

                    data.forEach((annonce, index) => {
                        fetch('http://localhost:3000/checkinteresses/' + annonce.id_annonce)
                            .then(response => response.json())
                            .then(data => {
                                const personnesInteresseesElement = annonceElement.querySelector('.personnesInteressees_number');
                                personnesInteresseesElement.textContent = data.count;
                            })
                            .catch(error => {
                                console.error('Erreur lors de la récupération du nombre de personnes intéressées:', error);
                            });
                        const annonceElement = document.createElement('li');
                        let rawDate = new Date(annonce.date_annonce);
                        let formattedDate = ("0" + rawDate.getDate()).slice(-2) + "/" + ("0" + (rawDate.getMonth() + 1)).slice(-2) + "/" + rawDate.getFullYear();

                        annonceElement.innerHTML = `
        <div class="slider_container">
          <table class="jobCard_mainContent" cellpadding="0" cellspacing="0" role="presentation">
            <tbody>
              <tr>
                <td class="resultContent">
                  <div>
                    <h2 class="title">${annonce.titre_annonce}</h2>
                  </div>
                  <div class="infosGenerales">
                    <div class="date_annonce">${formattedDate}</div>
                    <div class="state">${annonce.state}</div>
                    <div class="personnesInteressees">
                    <span class="personnesInteressees_title">Personnes intéressées :</span>
                    <span class="personnesInteressees_number"></span>
                  </div>
                  <button class="view-more" data-index="${index}">Voir plus</button>
                  <button class="remove" data-index="${index}">Supprimer l'annonce</button>
                  
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

                        annoncesList.appendChild(annonceElement);
                    });
                    document.querySelectorAll('.remove').forEach((btn) => {
                        btn.addEventListener('click', (event) => {
                            const annonceId = data[event.target.dataset.index].id_annonce;
                            fetch(`http://localhost:3000/delete-annonce/${annonceId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    id: annonceId
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    showPopup("Annonce supprimée", "error");
                                    setTimeout(() => {
                                        window.location.href = '/dashboard';
                                    }, 1000);
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                });
                        })
                    })



                    document.querySelectorAll('.view-more').forEach((btn) => {
                        btn.addEventListener('click', (event) => {
                            const btnText = event.target.innerText;
                            if (btnText === "Voir plus") {
                                event.target.innerText = "Voir moins";
                                const annonce = data[event.target.dataset.index];
                                const rightElement = document.createElement('div');

                                rightElement.innerHTML = `
            <div class="attribut">
              <span class="attribut_label"><h3>Prix du bien:</h3></span>
              <div class="editable-value" data-field="prix_bien" data-type="annonce">${annonce.prix_bien}</div>
              <button class="edit-button">Modifier</button>
              <button class="save-button" style="display: none;">Enregistrer</button>
            </div>
            <div class="attribut">
              <span class="attribut_label"><h3>Surface:</h3></span>
              <div class="editable-value" data-field="surface" data-type="annonce">${annonce.surface}</div>
              <button class="edit-button">Modifier</button>
              <button class="save-button" style="display: none;">Enregistrer</button>
            </div>
            <div class="attribut">
              <span class="attribut_label"><h3>Descriptions:</h3></span>
              <div class="editable-value" data-field="descriptions" data-type="annonce">${annonce.descriptions}</div>
              <button class="edit-button">Modifier</button>
              <button class="save-button" style="display: none;">Enregistrer</button>
            </div>
            <div class="attribut">
              <span class="attribut_label"><h3>Adresse:</h3></span>
              <div class="editable-value" data-field="address" data-type="annonce">${annonce.address}</div>
              <button class="edit-button">Modifier</button>
              <button class="save-button" style="display: none;">Enregistrer</button>
            </div>
            <div class="attribut">
                <span class="attribut_label"><h3>Code postal:</h3></span>
                <div class="editable-value" data-field="postal_code" data-type="annonce">${annonce.zip_code}</div>
                <button class="edit-button">Modifier</button>
                <button class="save-button" style="display: none;">Enregistrer</button>
            </div>
            <div class="attribut">
                <span class="attribut_label"><h3>Ville:</h3></span>
                <div class="editable-value" data-field="city" data-type="annonce">${annonce.city}</div>
                <button class="edit-button">Modifier</button>
                <button class="save-button" style="display: none;">Enregistrer</button>
            </div>
          `;

                                rightDisplay.innerHTML = '';
                                rightDisplay.appendChild(rightElement);
                                rightPanel.classList.remove('hidden');

                                rightElement.querySelectorAll('.edit-button').forEach((editButton) => {
                                    const editableValue = editButton.parentNode.querySelector('.editable-value');
                                    const saveButton = editButton.parentNode.querySelector('.save-button');

                                    editButton.addEventListener('click', () => {
                                        const textarea = document.createElement('textarea');
                                        textarea.value = editableValue.innerText;

                                        editableValue.innerHTML = '';
                                        editableValue.appendChild(textarea);

                                        saveButton.style.display = 'block';
                                        editButton.style.display = 'none';
                                    });

                                    saveButton.addEventListener('click', () => {
                                        const fieldValue = editableValue.getAttribute('data-field');
                                        console.log(fieldValue);
                                        const fieldType = editableValue.getAttribute('data-type');
                                        const newValue = editableValue.parentNode.querySelector('textarea').value;
                                        editableValue.innerText = newValue;
                                        saveButton.style.display = 'none';
                                        editButton.style.display = 'block';

                                        // Envoyer la requête de mise à jour à la base de données
                                        const annonceId = data[event.target.dataset.index].id_annonce;
                                        fetch(`/update-annonce/${fieldValue}/${annonceId}`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                field: fieldValue,
                                                value: newValue
                                            })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                console.log(newValue)
                                                console.log('Annonce mise à jour:', data);
                                            })
                                            .catch(error => {
                                                console.error('Erreur lors de la mise à jour de l\'annonce:', error);
                                            });
                                    });
                                });
                            } else {
                                event.target.innerText = "Voir plus";
                                rightDisplay.innerHTML = '';
                                rightPanel.classList.add('hidden');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('Erreur:', error);
                });

        }

    })
    .catch((error) => {
        console.error('Erreur:', error);
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

function voirMessage() {
    let id_utilisateur = null;
    let id_autre_utilisateur = null;
    fetch('/session', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.id_utilisateur) {
                id_autre_utilisateur = data.id_utilisateur;
            } else {
                showPopup('Erreur', 'error');
            }
        }).catch((error) => {
            console.error('Error:', error);
        });


}
console.log(annonce.id_annonce);
function downloadFiles(event, data) {
    const btnElement = event.currentTarget;
    const annonceId = btnElement.getAttribute('data-annonce-id');
    console.log(annonceId);

    const dataIndex = Number(btnElement.getAttribute('data-index'));

    if (isNaN(dataIndex)) {
        console.error('Error: Invalid data-index value');
        return;
    }

    const annonceData = data[dataIndex];

    if (!annonceData) {
        console.error('Error: No data found for index', dataIndex);
        return;
    }

    // Récupérer l'id_utilisateur en appelant l'API
    fetch(`/get-userId/${annonceId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            const userId = data.id_utilisateur;
            console.log(userId);

            const options = ['identity', 'salary', 'sale'];

            // Télécharger les fichiers
            options.reduce((promiseChain, option) => {
                return promiseChain.then(() => {
                    // Récupérer les fichiers en appelant l'API de téléchargement
                    return fetch(`/download/${option}/${userId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("Network response was not ok");
                            }
                            return response.blob();
                        })
                        .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = `${option}-${userId}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                        });
                });
            }, Promise.resolve())
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

