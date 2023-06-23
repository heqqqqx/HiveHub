const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'upload/' });
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const os = require('os');

// Crée un client
const storage = new Storage({ keyFilename: "helpful-pixel-389707-0ca50844ca16.json" });
const bucketName = 'web_project_solution_factory';
const app = express();
app.use(cors());
app.use(bodyParser.json());


// Serve static files from the "public" directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/html/drag&slid.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname+'/public/html/index.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname+'/public/html/register.html');
});
app.get('/simu', (req, res) => {
    res.sendFile(__dirname+'/public/html/simu.html');
});


// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // your mysql username
    password: '{Al37_Be36', // your mysql password
    database: 'solution_factory' // your database name
});
connection.connect(error => {
    if (error) {
        console.error('error connecting: ' + error.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

// Account Creation API
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.post('/create-account', (req, res) => {
    let { nom, prenom, date_naissance, adresse, email, mot_de_passe, type_utilisateur } = req.body;
    const date_inscription = new Date();

    const dob = new Date(date_naissance);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    if (age < 18) {
        res.status(400).send({ message: 'You must be at least 18 years old to create an account.' });
        return;
    }

    // Hash the password
    bcrypt.hash(mot_de_passe, saltRounds, (err, hash) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: 'Error hashing password.' });
        } else {
            mot_de_passe = hash;

            const checkUserSql = 'SELECT * FROM Utilisateurs WHERE email = ?';
            connection.query(checkUserSql, [email], (error, results) => {
                if (error) {
                    console.error(error);
                    res.status(500).send({ message: 'Server Error' });
                } else if (results.length > 0) {
                    res.status(409).send({ message: 'User with this email already exists.' });
                } else {
                    const sql = `INSERT INTO Utilisateurs (nom, prenom, date_naissance, adresse, email, mot_de_passe, type_utilisateur, date_inscription) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                    connection.query(sql, [nom, prenom, date_naissance, adresse, email, mot_de_passe, type_utilisateur, date_inscription], (error, results) => {
                        if(error) {
                            console.error(error);
                            res.status(500).send({ message: 'Server Error' });
                        } else {
                            res.status(200).send({ id: results.insertId, message: 'Account created successfully' });
                        }
                    });
                }
            });
        }
    });
});

app.post('/login', (req, res) => {
    const { email, mot_de_passe } = req.body;

    // Check if the user exists
    const sql = 'SELECT * FROM Utilisateurs WHERE email = ?';
    connection.query(sql, [email], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Server Error' });
        } else if (results.length === 0) {
            // User does not exist
            res.status(401).send({ message: 'Invalid email or password.' });
        } else {
            // User exists, check the password
            const user = results[0];
            bcrypt.compare(mot_de_passe, user.mot_de_passe, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send({ message: 'Server Error' });
                } else if (!result) {
                    // Password does not match
                    res.status(401).send({ message: 'Invalid email or password.' });
                } else {
                    // Password matches, generate a JWT
                    const payload = { id: user.id, email: user.email, type_utilisateur: user.type_utilisateur };
                    const token = jwt.sign(payload, 'abcd', { expiresIn: '1h' });

                    res.status(200).send({ token });
                }
            });
        }
    });
});


const fs = require('fs');
const path = require('path');


const uploadDirectory = path.join(__dirname, 'upload');

app.post('/upload', upload.array('file'), (req, res) => {
    async function uploadFile(file, index) {
        const newFilename = `fichier${index + 1}-23`;
        const filePath = path.join(uploadDirectory, newFilename);

        await fs.promises.rename(file.path, filePath); 

        await storage.bucket(bucketName).upload(filePath, {
            gzip: true,
            metadata: {
                cacheControl: 'no-cache',
            },
        });

        console.log(`${newFilename} uploaded to ${bucketName}.`);
    }

    if (req.files) {
        for (const [index, file] of req.files.entries()) {
            uploadFile(file, index).catch(console.error);
        }
    }

    res.send({
        status: 'ok'
    });
});


app.get('/download/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    console.log('File ID:', fileId); 

    const tmpDir = os.tmpdir();
    console.log('Temp directory:', tmpDir); 

    console.log('Temp directory:', tmpDir);
    console.log('File ID:', fileId);
    
    const filePath = path.join(tmpDir, fileId);
    console.log('File path:', filePath);
    
    const destination = filePath;  
    const options = {
        destination: destination,
    };
    
    try {
        await storage.bucket(bucketName).file(fileId).download(options);
        console.log(`File ${fileId} downloaded to ${destination}`);
        console.log('Check if file exists:', fs.existsSync(destination));
    } catch (error) {
        console.error(`Error downloading file ${fileId}:`, error);
        res.status(500).send('Error downloading file');
        return;
    }
    
    console.log(`Sending file ${fileId} to client...`);
    console.log('Path to send file:', destination);
    
    try {
        res.download(destination);
        console.log(`File ${fileId} sent to client`);
    } catch (error) {
        console.error(`Error sending file ${fileId} to client:`, error);
        res.status(500).send('Error sending file to client');
    }
    
});





app.listen(3000, () => {
    console.log('Server started on port 3000');
});
