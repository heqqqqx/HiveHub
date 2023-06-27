const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'upload/' });
const { Storage } = require('@google-cloud/storage');
<<<<<<< Updated upstream
=======
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
>>>>>>> Stashed changes

// Crée un client
const storage = new Storage({ keyFilename: "helpful-pixel-389707-0ca50844ca16.json" });
const bucketName = 'web_project_solution_factory';

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/public/html/drag&slid.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname+'/public/html/index.html');
});
<<<<<<< Updated upstream
=======
app.get('/register', (req, res) => {
    res.sendFile(__dirname+'/public/html/register.html');
});
app.get('/simu', (req, res) => {
    res.sendFile(__dirname+'/public/html/simu.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname+'/public/html/login.html');
});

app.get('/annonces', (req, res) => {
    res.sendFile(__dirname+'/public/html/annonces.html');
});

// MySQL Connection
const connection = mysql.createConnection({
    host: 'root@77.68.80.193',
    user: 'root2', // your mysql username
    password: 'Mathis1!', // your mysql password
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
                    const secretKey = '1234'; // Changez ça par une clé secrète complexe
                    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

                    res.status(200).send({ token });
                }
            });
        }
    });
});






>>>>>>> Stashed changes





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
