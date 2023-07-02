fetch('http://localhost:3000/getdata')
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
                       <span class="prix_bien">${annonce.prix_bien}</span>
                   </div>
                   <div class="attribut">
                       <span class="attribut_label"><h3>Surface:</h3></span>
                       <span class="surface">${annonce.surface}</span>
                   </div>
                   <div class="attribut">
                       <span class="attribut_label"><h3>Descriptions:</h3></span>
                       <span class="descriptions">${annonce.descriptions}</span>
                   </div>
                   
                   <div class="attribut">
                       <span class="attribut_label"><h3>Addresse:</h3></span>
                       <span class="address">${annonce.address}, ${annonce.zip_code}, ${annonce.city}</span>
                   </div>
               `;

                    rightDisplay.innerHTML = '';
                    rightDisplay.appendChild(rightElement);
                    rightPanel.classList.remove('hidden');
                } else {
                    event.target.innerText = "Voir plus";
                    rightDisplay.innerHTML = '';
                    rightPanel.classList.add('hidden');
                }
            });
        });
    })
    .catch((error) => {
        console.error('Erreur :', error);
    });