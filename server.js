const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'upload/' });
const { Storage } = require('@google-cloud/storage');

// Crée un client
const storage = new Storage({ keyFilename: "helpful-pixel-389707-0ca50844ca16.json" });
const bucketName = 'web_project_solution_factory';

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/drag&slid.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
    async function uploadFile() {
        await storage.bucket(bucketName).upload(req.file.path, {
            gzip: true,
            metadata: {
                cacheControl: 'no-cache',
            },
        });

        console.log(`${req.file.originalname} uploaded to ${bucketName}.`);
    }

    uploadFile().catch(console.error);

    res.send({
        status: 'ok'
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
