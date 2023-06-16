// Importe le package Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Crée un client
const storage = new Storage({keyFilename: "helpful-pixel-389707-0ca50844ca16.json"});

async function uploadFile(bucketName, filename) {
  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filename, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: 'no-cache',
    },
  });

  console.log(`${filename} uploaded to ${bucketName}.`);
}

uploadFile('web_project_solution_factory', '/Users/alexandre/Downloads/Projet_Rogue_Like.pdf').catch(console.error);
