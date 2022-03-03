// New stuff for email reset
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const url = require('url');
const express = require('express');
const process = require('process');
const { Client } = require('pg');
const cors = require('cors'); // For all access for all domains.
const request = require('request'); // For external API calls.
const bcrypt = require('bcryptjs'); // Password hash crypt.
const requests = require('./movieAPI/request');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const nodemailer = require('nodemailer');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Documentation: https://swagger.io/specification/#infoObject
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'My Movies API',
            version: "1.0.0",
            description: "This is sample of the REST API server that runs on heroku. Here you can view all the available routes for the API",
            contact: {
                name: "Creator",
                email: "mymovies.noreply@gmail.com"
            },
            servers: ["https://moviesoftwareapi.herokuapp.com"]
        }
    },
    apis:['index.js']
}

const swaggerDocs = swaggerJsDoc(options);

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const client = new Client({
    user: "fcncirfhfkwocb",
    password: "16f2e54ffe015bf368889c50d4574bbf7028dc1bfa4e9d4b436c0caf129ec1f4",
    host: "ec2-54-172-219-6.compute-1.amazonaws.com",
    port: 5432,
    database: "ddhdsglt7t3ubs"
})

client.connect()
    .then(() => console.log("Connected successfully!"))
    .catch(error => console.log(error));

// Swagger schemas
/**
 * @swagger
 * components:
 *   schemas:
 *     Users:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           description: Users username
 *         email:
 *           type: string
 *           description: Users email address
 *       example:
 *         username: exampleUsername
 *         email: example@email.com
 *
 *
 */

// Swagger Tags
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Requests for user information.
 *
 */


app.get("/", (req,res) => {
    res.send("REST API STATE = ONLINE");
})



// Routes
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve users username and email address with username
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Users username
 *     responses:
 *       200:
 *         description: Successfully retrieved users username & email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/Users'
 *
 *       404:
 *          description: User not found!
 *
 *
 *       500:
 *          description: Problems with the database.
 *
 *
 *
 */

app.get('/api/users', urlencodedParser, function(req,res) {
    const urlQuery = url.parse(req.url, true).query;
    let username = urlQuery.username;

    (async () => {
        try {
            let results = await client.query(`SELECT username, email FROM users WHERE username=$1`, [username]);
            let user = results.rows[0];

            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({"message": "User not found"});
            }
        }catch (err) {
            res.status(500).json({"message":"Problems with the database."})
        }

    })();
})

// Updates users username and email.
app.post('/api/users', function(req,res){
    let data = req.body;

    let newUsername = data.newUsername;
    let username = data.username;
    let email = data.email;

    if(validateEmail(email) && validateCredential(newUsername)) {
        (async () => {
            try {
                await client.query(`UPDATE users SET username=$1, email=$2 WHERE username=$3`, [newUsername, email, username]);
                res.status(200).json({"message": "Successfully updated user credentials!"})
            } catch (err) {
                res.status(500).json({"message": "Error while trying to update user credentials."});
            }
        })();
    } else if(validateEmail(email)){
        res.status(400).json({"message":"Username must be 4-20 characters & can't start or end with a . or _ or have two of them in a row!"});
    } else {
        res.status(400).json({"message":"Email address must be a valid email! i.e. example@email.com"});
    }

})


// Returns movies from trending(TMDB API), can specify the page since tmdb api only provides data queries of single page at a time.
app.get('/api/movies/trending', urlencodedParser, (req,res) => {
    const urlQuery = url.parse(req.url, true).query;
    const page = urlQuery.page;

    (async () => {
        try {
            request(requests.fetchTrending + page, function(error, response, body) {
                let movies = JSON.parse(body).results;
                if(movies.length >= 1) {
                    res.send(movies);
                } else {
                    res.send(404).json({"error": "No movies found!"})
                }
            });
        } catch(error) {
            res.status(500).json({"message": "Error getting movies"})
        }
    })();
});


// Return movies by genre, page is also needed to fetch these movies.
app.get('/api/movies/genre', urlencodedParser, (req,res) => {
    const urlQuery = url.parse(req.url, true).query;
    const genre = urlQuery.genre;
    const page = urlQuery.page;

    (async () => {
        try {
            request(requests.fetchMoviesByGenre + genre + "&page=" + page, function (error, response, body) {
                let movies = JSON.parse(body).results;
                if (movies.length >= 1) {

                    res.send(movies);
                } else {
                    res.send(404).json({"error": "No movies found!"})
                }
            });
        } catch(error) {
            res.status(500).json({"message": "Error getting movies"})
        }
    })();
});

// Used for searching a movie with given movie name.
app.get('/api/movies/search', urlencodedParser, function(req, res) {
    const urlQuery = url.parse(req.url, true).query;
    const movieName = urlQuery.name.replace(/\s+/g, "+"); // Replace all spaces with + sign.

    (async () => {
        try {
            await request(requests.search + movieName, function(error, response, body) {
                let movies = JSON.parse(body).results;
                if(movies.length >= 1) {
                    res.status(200).json(movies);
                } else {
                    res.send({"message": "No movies found with the given input!"})
                }
            });
        } catch(error) {
            res.send({"message": "Error while searching movies."})
        }
    })();
});

// Gets all movies from the database, related to the user requesting the movies -> returns all users watched movies.
app.get('/api/movies', urlencodedParser, function (req, res) {
    let urlQuery = url.parse(req.url, true).query;
    let user = urlQuery.user;

    (async () => {
        try {
            let query = `SELECT * FROM movie WHERE movie.id IN (SELECT movieid FROM user_movie WHERE userid IN (SELECT users.id FROM users WHERE username = $1))`;
            let result = await client.query(query, [user]);
            let jsonObj = result.rows;
            res.status(200).json(jsonObj);
        }catch(error) {
            console.log(error);
            res.send(error.stack);
        }
    })()
})

// Saves movie information to database according to the user credentials.
app.post('/api/movies', function(req,res) {
    let movie = req.body;

    if(movie !== null) {
        const title = movie.title;
        const genres = movie.genres;
        const overview = movie.overview;
        const posterPath = movie.posterpath;
        const runtime = movie.runtime;
        const trailerID = movie.trailerid;
        const tmdbID = movie.tmdbid;
        const date = movie.date;
        const username = movie.user;


        // Check if the movie is in database. If it's not add it there.
        (async () => {
            try {
                let sql;
                let results = await client.query('SELECT id, title FROM movie WHERE title=$1 AND tmdbid=$2', [title, tmdbID]);
                let rows = results.rows;

                // If the movie wasn't found, add it to database.
                if (rows.length < 1) {
                    // INSERT query for adding the movie.
                    await client.query('INSERT INTO movie(title, date, tmdbid, runtime, genres, overview, poster_path, trailerid) ' +
                        'VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [title, date, tmdbID, runtime, genres, overview, posterPath, trailerID])
                        .then(results => console.log(results))
                        .catch(err => res.send({"message": "Adding movie failed!", "error": err.stack}));
                }

                // Search for usernames ID
                sql = `SELECT id FROM users WHERE username=$1`;
                results = await client.query(sql,[username]);
                let userID = results.rows[0].id;

                // Search for movies ID
                results = await client.query('SELECT id FROM movie WHERE title=$1 AND tmdbid=$2', [title, tmdbID]);
                let movieID = results.rows[0].id;

                // First we check if the movie is already in the user's database.
                sql = `SELECT * FROM user_movie WHERE userid=$1 AND movieid =$2`
                let confirmMovieDoesntExists = await client.query(sql, [userID, movieID]);

                // If we found out that the user doesn't have this movie we save it.
                if(confirmMovieDoesntExists.rows.length < 1) {

                    await client.query('INSERT INTO user_movie(userid, movieid) VALUES($1, $2)', [userID, movieID])
                        .then(() => res.status(201).json({"message": title + " successfully added to your movies!"}))
                        .catch(e => res.send({"message": "saving movie for user failed!"}));
                }
                else {
                    res.status(409).json({"message": "You already have " + title + " added to your movies!"});
                }
            } catch (error) {
                res.send({"message": error.message + "error:" + error});
            }
        })();
    } else {
        res.status(400).json({"message": "Data is null or invalid!"});
    }
})

// Deletes movie from the user_movie table which holds users saved movies.
app.delete('/api/movies',urlencodedParser, function(req,res) {
    let urlQuery = url.parse(req.url, true).query;
    let user = urlQuery.user; // Username of a user
    let movieTitle = urlQuery.title; // Title of the movie
    let tmdbid = urlQuery.tmdbid; // tmdbid of the movie

    (async () => {
        try {
            // Get users id.
            let sql = `SELECT id FROM users WHERE username=$1`;
            let results = await client.query(sql, [user]);
            let userID = results.rows[0].id;

            // Get movie id.
            sql = `SELECT id FROM movie WHERE title=$1 AND tmdbid=$2`;
            results = await client.query(sql, [movieTitle, tmdbid]);
            let movieID = results.rows[0].id;

            // Remove the movie from the database.
            sql = `DELETE FROM user_movie WHERE userid=$1 AND movieid=$2`;
            await client.query(sql,[userID, movieID]);
            res.status(200).json("Movie successfully removed.");
        } catch (error) {
            res.status(404).json({"message": "Problems removing the movie."});
        }

    })();
})


// Post method for login in. Currently doesn't validate the username in any way.
app.post('/api/login', function(req, res) {
    const data = req.body;
    const username = data.username; // String of username
    const password = data.password; // String of password

    // Check from database if user is valid
    (async () => {
        try {
            const checkQuery = `SELECT username, password FROM users WHERE username =$1`;
            const results = await client.query(checkQuery,[username]);
            const rows = results.rows;

            // Should give 1 row of data if user is registered.
            if(rows.length > 0) {
                const usernameDB = rows[0].username;
                const passwordDB = rows[0].password;

                // Compares the inserted password to the one in database.
                bcrypt.compare(password,passwordDB, function(error,response) {
                    if(response && usernameDB === username) {
                        res.status(200).json({"message": "User credentials authenticated."});
                    } else {
                        res.status(401).json({"error": "Invalid credentials."});
                    }
                })
            } else {
                res.status(401).json({"error": "Invalid credentials."});
            }
        } catch (error) {
            res.status(500).json({"error": error.message});
        }
    })();
});

/**
 * Creates an account for the user.
 * Hashes the password and check the correct validation of the username, password & email.
 */
app.post('/api/register', function(req, res) {
    // Reveice all neede data from request body.
    const dataReceived = req.body;
    const username = dataReceived.username;
    const password = dataReceived.password;
    const email = dataReceived.email;
    const userLevel = 'user';
    const isUsernameValid = validateCredential(username);
    const isPasswordValid = validateCredential(password);
    const isEmailValid = validateEmail(email);

    // Check validations one more time.
    if(isUsernameValid && isPasswordValid && isEmailValid) {

        // 2. Hashes the password
        const pass = bcrypt.hashSync(password, 12); // String of password for db

        // 3. Check if username already exists and acts accordingly.
        (async () => {
            try {
                // 4. Checks if the username already exists.
                const checkQuery = `SELECT username FROM users WHERE username =$1`;
                const results = await client.query(checkQuery, [username]);

                // 5. If username does not exists -> save the user to database & send a 201(CREATE) status code with message.
                if(results.rows.length < 1) {
                    const insertQuery = `INSERT INTO users(username,password,user_level,email) VALUES($1, $2, $3, $4)`;
                    await client.query(insertQuery, [username, pass, userLevel, email]);
                    res.status(201).json({"message": "Account was successfully created!"})
                } else {
                    res.status(403).json({"error": "The username is already taken. Pick another one."});
                }
            } catch (error) {
                res.status(500).json({"error": error.message});
            }
        })();

    } else if(!isEmailValid){
        res.status(403).json({"error": "Email address must be a valid email! i.e. example@email.com"});
    } else {
        res.status(403).json({"error": "Username/Password must be 4-20 characters in length, they can't start or end with a . or _ or have two of them in a row!"});
    }
});

// Sends a reset password link through email for the user.
app.post('/api/reset-password', function(req, res) {

    const email = req.body.email;

    (async () => {
        try {
            // Check if email exists.
            let results = await client.query(`SELECT * FROM users WHERE email =$1`, [email]);
            let user = results.rows[0];

            let type = '';
            let msg = '';

            if (user) {
                let data = {
                    email: user.email,
                    username: user.username
                }
                let token = jwt.sign(data, process.env.JWT_SECRET_KEY);
                sendEmail(email, token); // Send email to the email that was given.
                // If the email was sent we update that users token attribute on database.
                client.query(`UPDATE users SET token=$1 WHERE email=$2`, [token, email]);
                type = 'success';
                msg = 'The reset password link has been sent to your email address';
            } else {
                type = 'error';
                msg = 'The Email is not registered with us';
            }
            const message = {
                type: type,
                msg: msg
            }
            res.status(200).json(message);
        } catch (err) {
            const response = {
                type: 'error',
                msg: 'There was an error with the database,'
            }
            res.send(response);
        }
    })();
});

// Updates the password that needed resetting.
app.post('/api/update-password', function(req, res, next) {
    const token = req.body.token;
    const password = req.body.password;

    (async () => {
        try {
            let results = await client.query(`SELECT * FROM users WHERE token=$1`, [token]);
            let user = results.rows[0];

            let type = '';
            let msg = '';

            if (user) {
                let hashedPass = bcrypt.hashSync(password, 12);
                await client.query(`UPDATE users SET password=$1 WHERE token=$2`, [hashedPass, token]);
                type = 'success';
                msg = 'Your password has been updated successfully';

                // Remove the token from the database.
                await client.query(`UPDATE users SET token=null WHERE username=$1`, [user.username]);
            } else {
                type = 'error';
                msg = 'Invalid credentials or something else went wrong!';
            }
            const message = {
                type: type,
                msg: msg
            }
            res.status(200).json(message);
        }catch (err) {
            res.send("Error while updating password, sorry about this.")
        }
    })();
});


// Validates email, accepts simple format  xxx@yyy.zzz
function validateEmail(email) {
    const regex = ".+\\@.+\\..+";
    let pattern = new RegExp(regex);
    return pattern.test(email);
}

// Validates credential(username & password). Length must be between 4-20.
function validateCredential(credentialToValidate) {
    // Regex accepts usernames and passwords that contain 4-20 characters that contain only letters and numbers.
    let regex = /^[a-zA-Z0-9]{4,20}$/;
    let pattern = new RegExp(regex);
    return pattern.test(credentialToValidate);
}

function sendEmail(emailAddress, usersToken) {

    let email = emailAddress;
    let token = usersToken;

    let mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME, // Your email id
            pass: process.env.EMAIL_PASSWORD // Your password
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Reset Password Link - My Movies',
        html: '<h1>Dear User Of My Movies</h1>' +
            '<br>' +
            '<p>You requested for reset password, kindly use this <a href="http://localhost:3000/update-password/' + token + '">link</a> to reset your password.</p>' +
            '<br><p>Sincerely My Movies Team</p>'

    };

    mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}


const port = process.env.PORT || 4000;
app.listen(port, ()=>{
    console.log('Listening at port https://moviesoftwareapi.herokuapp.com:%s', port);
});
