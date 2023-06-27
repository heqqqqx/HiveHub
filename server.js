const express = require('express');
const session = require('express-session');
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
    res.sendFile(__dirname + '/public/html/createAnnonce.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/html/register.html');
});
app.get('/simu', (req, res) => {
    res.sendFile(__dirname + '/public/html/simu.html');
});
app.get('/annonces', (req, res) => {
    res.sendFile(__dirname + '/public/html/displayAnnonces.html');
});

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // your mysql username
    password: 'root', // your mysql password
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

app.use(session({
    secret: 'SeCrEtCoDe37_Be36{',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 60
    }
}));




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
                        if (error) {
                            console.error(error);
                            res.status(500).send({ message: 'Server Error' });
                        } else {
                            // Stocker l'ID utilisateur dans la session
                            req.session.userId = results.insertId;

                            res.status(200).send({ id: results.insertId, message: 'Account created successfully' });
                        }
                    });
                }
            });
        }
    });
});



app.get('/getdata', (req, res) => {
    let sql = 'SELECT * FROM annonces';
    connection.query(sql, (err, results) => {
        if(err) throw err;
        console.log(results);
        res.send(results);
    });
});
app.post('/login', (req, res) => {
    const { email, mot_de_passe } = req.body;

    const sql = 'SELECT * FROM Utilisateurs WHERE email = ?';
    connection.query(sql, [email], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Server Error' });
        } else if (results.length === 0) {
            res.status(401).send({ message: 'Invalid email or password.' });
        } else {
            const user = results[0];
            bcrypt.compare(mot_de_passe, user.mot_de_passe, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send({ message: 'Server Error' });
                } else if (!result) {
                    res.status(401).send({ message: 'Invalid email or password.' });
                } else {

                    const payload = { id: user.id, email: user.email, type_utilisateur: user.type_utilisateur };
                    const token = jwt.sign(payload, 'abcd', { expiresIn: '1h' });

                    res.status(200).send({ token });
                }
            });
        }
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: 'Server Error' });
        } else {
            res.status(200).send({ message: 'Logout successful' });
        }
    });
});


app.get('/session', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        res.status(200).send({});
        return;
    }

    const sql = 'SELECT * FROM Utilisateurs WHERE id_utilisateur = ?';
    connection.query(sql, [userId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Server Error' });
        } else if (results.length === 0) {
            res.status(200).send({});
        } else {
            const user = results[0];
            const { id_utilisateur, nom, prenom, email, type_utilisateur } = user;
            res.status(200).send({ id_utilisateur, nom, prenom, email, type_utilisateur });
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

let id = 30;
let id_dosier = 0;
app.post('/create-annonce', (req, res) => {
    let { name, state, city, zipCode, address, prix, date, surface, description } = req.body;
    id++;
    id_dosier++;
    date = new Date().toISOString().slice(0, 10);
    let query = `INSERT INTO Annonces (id_annonce, titre_annonce, prix_bien, surface, descriptions, date_annonce, zip_code, city, state, address) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [id, name, prix, surface, description, date, zipCode, city, state, address], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Server Error' });
        } else {
            res.status(200).send({ id: results.insertId, message: 'Annonce created successfully' });
        }
    });
});



app.listen(3000, () => {
    console.log('Server started on port 3000');
});
