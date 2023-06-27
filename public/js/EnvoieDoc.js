// tableau pour stocker les fichiers sélectionnés
let selectedFiles = [];

// gestionnaires d'événements pour chaque zone de dépôt
function handleFileDrop1(event) {
  event.preventDefault();
  selectedFiles.push(event.dataTransfer.files[0]);
}

function handleFileDrop2(event) {
  event.preventDefault();
  selectedFiles.push(event.dataTransfer.files[0]);
}

function handleFileDrop3(event) {
  event.preventDefault();
  selectedFiles.push(event.dataTransfer.files[0]);
}

// gestionnaire d'événements pour le bouton d'envoi
function uploadFiles() {
  let formData = new FormData();
  selectedFiles.forEach((file, index) => {
    formData.append("file" + index, file);
  });

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
