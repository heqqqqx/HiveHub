let selectedFiles = [];

function handleFileDrop1(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  console.log('File dropped in zone 1: ', file);
  selectedFiles.push(file);
  console.log('Current selectedFiles: ', selectedFiles);
}

function handleFileDrop2(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  console.log('File dropped in zone 2: ', file);
  selectedFiles.push(file);
  console.log('Current selectedFiles: ', selectedFiles);
}

function handleFileDrop3(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  console.log('File dropped in zone 3: ', file);
  selectedFiles.push(file);
  console.log('Current selectedFiles: ', selectedFiles);
}


function uploadFiles() {
  console.log('Uploading files...');
  let formData = new FormData();
  formData.append("identity", selectedFiles[0]);
  formData.append("salary", selectedFiles[1]);
  formData.append("sale", selectedFiles[2]);
  
  console.log('formData: ', formData); 
  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    console.log('Response: ', response);
    return response.json();
  })
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
