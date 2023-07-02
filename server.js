//constant
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const upload = multer({ dest: 'upload/' });
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const os = require('os');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// Crée un client
const storage = new Storage({ keyFilename: "helpful-pixel-389707-0ca50844ca16.json" });
const bucketName = 'web_project_solution_factory';
const app = express();

//app.use
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));


//app.get
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});
app.get('/createAnnonce', (req, res) => {
    res.sendFile(__dirname + '/public/html/createAnnonce.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/html/register.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/html/login.html');
});
app.get('/simu', (req, res) => {
    res.sendFile(__dirname + '/public/html/simu.html');
});
app.get('/annonces', (req, res) => {
    res.sendFile(__dirname + '/public/html/displayAnnonces.html');
});
app.get('/getTokenPro', (req, res) => {
    res.sendFile(__dirname + '/public/html/getTokenPro.html');
});
app.get('/registerPro', (req, res) => {
    res.sendFile(__dirname + '/public/html/registerPro.html');
});

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'solution_factory'
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

function envoyerMail(email, subject, texte) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'monpremierbien@gmail.com',
            pass: 'jtdtzwzhqxqmwksu'
        }
    });

    const mailOptions = {
        from: 'votre_adresse_gmail@gmail.com',
        to: email,
        subject: subject,
        text: texte
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Erreur lors de l\'envoi de l\'e-mail de bienvenue.' });
        } else {
            res.status(200).send({ id: results.insertId, message: 'Compte créé avec succès. Un e-mail de bienvenue a été envoyé.' });
        }
    });
}


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
                            console.log("user id : ", results.insertId)
                            req.session.userId = results.insertId;

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

    // Vérifier si l'utilisateur existe
    const sql = 'SELECT * FROM Utilisateurs WHERE email = ?';
    connection.query(sql, [email], (error, results) => {

        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Server Error' });
        } else if (results.length === 0) {
            res.status(401).send({ message: 'Invalid email or password.' });
        } else {
            // Vérifier le mot de passe
            bcrypt.compare(mot_de_passe, results[0].mot_de_passe, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).send({ message: 'Server Error' });
                } else if (!result) {
                    res.status(401).send({ message: 'Invalid email or password.' });
                } else {

                    req.session.userId = results[0].id_utilisateur;

                    res.status(200).send({ id: results[0].id_utilisateur, message: 'Logged in successfully' });
                }
            });
        }
    });
});



app.patch('/update-account', (req, res) => {
    const userId = req.session.userId;
    //user can only change his email and password
    const { email, mot_de_passe } = req.body;
    // Update the email and password in the database
    const sql = 'UPDATE Utilisateurs SET email = ?, mot_de_passe = ? WHERE id = ?';
    connection.query(sql, [email, mot_de_passe, userId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Server Error' });
        } else {
            res.status(200).send({ message: 'Address updated successfully' });
        }
    })
});
app.get('/getdata', (req, res) => {
    let sql = 'SELECT * FROM annonces';
    connection.query(sql, (err, results) => {
        if (err) throw err;
        console.log(results);
        res.send(results);
    });
});
app.get('/getmydata', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        res.status(403).send({ message: 'Not Authenticated' });
        return;
    }
    const query = 'SELECT * FROM annonces WHERE id_utilisateur = ?';
    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: 'Server Error' });
        } else {
            console.log(results);
            res.status(200).send(results);
        }
    });
});

const allowedDomains = ['@efrei.net', '@societegenerale.fr', ];
app.post('/get-email', (req, res) => {
    const { email } = req.body;
    console.log('E-mail récupéré:', email);

    // Check if the email is already present in the Utilisateurs table
    const checkUserSql = 'SELECT * FROM Utilisateurs WHERE email = ?';
    connection.query(checkUserSql, [email], (error, results) => {
        if (error) {
            console.error('Erreur lors de la vérification de l\'email dans la table Utilisateurs:', error);
            res.json({ success: false, message: 'Error checking email in the database' });
        } else if (results.length > 0) {
            console.log('L\'email est déjà présent dans la table Utilisateurs:', email);
            res.json({ success: false, message: 'Email already exists in the database' });
        } else {
            let isValid = false;
            for (const domain of allowedDomains) {
                if (email.endsWith(domain)) {
                    isValid = true;
                    break;
                }
            }

            if (!isValid) {
                res.json({ success: false, message: 'Invalid email domain' });
                return;
            }

            const token = crypto.randomBytes(5).toString('hex');
            const registeringTime = new Date();

            const sql = 'INSERT INTO banquierR (email, token, registeringtime) VALUES (?, ?, ?)';
            connection.query(sql, [email, token, registeringTime], (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'insertion des données dans la table banquierR:', error);
                    res.json({ success: false, message: 'Error inserting data into table' });
                } else {
                    console.log('Données insérées avec succès dans la table banquierR. ID inséré:', results.insertId);
                    res.json({ success: true, email, token, registeringTime });
                    envoyerMail(email, "Inscription Token", token);
                }
            });
        }
    });
});


app.post('/create-accountPro', (req, res) => {
    let { nom, prenom, date_naissance, adresse, email, mot_de_passe, token } = req.body;
    console.log("trying to create account for " + email + " with token " + token);
    const type_utilisateur = "banquier";
    const date_inscription = new Date();


    const dob = new Date(date_naissance);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    if (age < 18) {
        console.log('User age:', age);
        res.status(400).send({ message: 'You must be at least 18 years old to create an account.' });
        return;
    }

    if (!email.endsWith('@efrei.net')) {
        console.log('Invalid email:', email);
        res.status(400).send({ message: 'Invalid email address. Please use an email ending with @efrei.net.' });
        return;
    }

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
                    console.log('User with this email already exists:', email);
                    res.status(409).send({ message: 'User with this email already exists.' });
                } else {
                    const checkTokenSql = 'SELECT * FROM banquierR WHERE email = ? AND token = ? AND registeringtime >= DATE_SUB(NOW(), INTERVAL 1 HOUR)';
                    connection.query(checkTokenSql, [email, token], (error, tokenResults) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send({ message: 'Server Error' });
                        } else if (tokenResults.length === 0) {
                            console.log('Invalid email, token, or expired token:', email, token);
                            res.status(403).send({ message: 'Invalid email, token, or expired token.' });
                        } else {
                            const fetchedEmail = tokenResults[0].email;
                            console.log('Email associated with the token:', fetchedEmail);

                            const sql = `INSERT INTO Utilisateurs (nom, prenom, date_naissance, adresse, email, mot_de_passe, type_utilisateur, date_inscription) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                            connection.query(sql, [nom, prenom, date_naissance, adresse, email, mot_de_passe, type_utilisateur, date_inscription], (error, results) => {
                                if (error) {
                                    console.error(error);
                                    res.status(500).send({ message: 'Server Error' });
                                } else {

                                    console.log('User account created:', results.insertId);
                                    res.status(200).send({ id: results.insertId, message: 'Account created successfully' });
                                }
                            });
                        }
                    });
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
            res.status(200).send({ message: 'Logged out' });
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



app.get('/dashboard', (req, res) => {
    const userId = req.session.userId;
    res.sendFile(__dirname + '/public/html/dashboard.html');
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


app.get('/download/:fileId', async(req, res) => {
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



app.post('/create-annonce', (req, res) => {
    let { name, id_utilisateur, state, city, zipCode, address, prix, date, surface, description } = req.body;
    date = new Date().toISOString().slice(0, 10);
    let query = `INSERT INTO Annonces ( titre_annonce, prix_bien, surface, descriptions, date_annonce, zip_code, city, state, address,id_utilisateur) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [name, prix, surface, description, date, zipCode, city, state, address, id_utilisateur], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send({ message: "error creating your account, you may have already created an account" });
        } else {
            res.status(200).send({ id: results.insertId, message: 'Annonce created successfully' });
        }
    });
});


// app.get('/check_annonces', (req, res) => {
//     const userId = req.session.userId;
//     const sql = 'SELECT * FROM Annonces WHERE id_utilisateur = ?';
//     connection.query(sql, [userId], (error, results) => {
//         if (error) {
//             console.error(error);
//             res.status(500).send({ message: 'User alreadycreated an annonce' });
//         } else if (results.length === 0) {
//             res.status(200).send({});
//         } else {
//             const user = results[0];
//             const { id_utilisateur, titre_annonce, prix_bien, surface, descriptions, date_annonce, zip_code, city, state, address } = user;
//             res.status(200).send({ id_utilisateur, titre_annonce, prix_bien, surface, descriptions, date_annonce, zip_code, city, state, address });
//         }
//     });
// });


app.listen(3000, () => {
    console.log('Server started on port 3000');
});