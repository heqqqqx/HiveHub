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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

            annoncesList.appendChild(annonceElement);
        });

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