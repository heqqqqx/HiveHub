var varbanquierId;

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

fetch('/session', {
  method: 'GET',
  credentials: 'include' // include cookies with the request
})
  .then(response => response.json())
  .then(data => {
    varbanquierId = data.id_utilisateur; // Récupérer le banquierId
    console.log('banquierId:', varbanquierId);
    if (data.type_utilisateur != 'banquier') {
      console.log('Redirecting to index.html');
      window.location.href = '/index';
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

fetch('http://localhost:3000/getdata')

  .then(response => response.json())
  .then(data => {

    const annoncesList = document.querySelector('.jobsearch-ResultsList');
    const rightDisplay = document.querySelector('.attributs_demande');
    const rightPanel = document.querySelector('.annonces-ViewAnnoncePaneWrapper');
    const filterForm = document.getElementById('filterForm');

    rightPanel.classList.add('hidden');

    annoncesList.innerHTML = '';
    rightDisplay.innerHTML = '';

    const renderAnnonces = (annonces) => {

        console.log('annonces:', annonces);
        if (annonces.message) {
            const annonceList = document.querySelector('.jobsearch-ResultsList');

            annonceList.innerHTML = '<li>Aucune annonce trouvée.</li>';
        } else {
        annonces.forEach((annonce, index) => {
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
            const annonce = annonces[event.target.dataset.index];
            const rightElement = document.createElement('div');

            rightElement.innerHTML = `
              <div class="attribut">
                <span class="attribut_label"><h3>Prix du bien (€):</h3></span>
                <span class="prix_bien">${annonce.prix_bien}</span>
              </div>
              <div class="attribut">
                <span class="attribut_label"><h3>Surface (m²):</h3></span>
                <span class="surface">${annonce.surface}</span>
              </div>
              <div class="attribut">
                <span class="attribut_label"><h3>Descriptions:</h3></span>
                <span class="descriptions">${annonce.descriptions}</span>
              </div>
              <div class="attribut">
                <span class="attribut_label"><h3>Adresse:</h3></span>
                <span class="address">${annonce.address}, ${annonce.zip_code}, ${annonce.city}</span>
              </div>
              <button class="mark-interested-btn" data-id="${annonce.id_annonce}">Marquer comme intéressé</button>
            `;

            rightDisplay.innerHTML = '';
            rightDisplay.appendChild(rightElement);
            rightPanel.classList.remove('hidden');

            const markInterestedBtn = document.querySelector('.mark-interested-btn');
            markInterestedBtn.addEventListener('click', () => {
              const annonceId = markInterestedBtn.dataset.id;
              const banquierId = varbanquierId;
              console.log('annonceId:', annonceId);
              console.log('banquierId:', banquierId);
              fetch('/annonces-interessees', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_banquier: varbanquierId, id_annonce: annonceId })
              })
                .then(response => response.json())
                .then(data => {
                  if (data.status == 200) {
                    showPopup(data.message, 'success');
                  } else {
                    showPopup(data.message, 'error');
                  }
                })
                .catch(error => {
                  console.error('Error:', error);
                  showPopup('Une erreur s\'est produite lors de la marquage comme intéressé.', 'error');
                });
            });

          } else {
            event.target.innerText = "Voir plus";
            rightDisplay.innerHTML = '';
            rightPanel.classList.add('hidden');
          }
        });
      });
    };
    }

    renderAnnonces(data);

    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(filterForm);
      const searchTerm = formData.get('searchTerm');
      const selectedRegion = formData.get('selectedRegion');

      fetch(`/getdata?recherche=${searchTerm}&region=${selectedRegion}`)
        .then(response => response.json())
        .then(filteredData => {
          annoncesList.innerHTML = '';
          renderAnnonces(filteredData);
        })
        .catch(error => {
          console.error('Erreur:', error);
        });
    });
  })
  .catch((error) => {
    console.error('Erreur :', error);
  });
