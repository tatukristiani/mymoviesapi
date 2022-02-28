// New stuff for email reset
const randomToken = require('random-token');

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

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


/* For school and authorization (json web token)
app.use(function(req,res,next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
})
 */


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



app.get("/", (req,res) => {
    res.send("REST API STATE = ONLINE");
})

// Currently show Trending movies on home page.
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


// Currently show Trending movies on home page.
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
            request(requests.search + movieName, function(error, response, body) {
                let movies = JSON.parse(body).results;
                if(movies.length >= 1) {
                    res.status(200).json(movies);
                } else {
                    res.send(404).json({"error": "No movies found with the given input!"})
                }
            });
        } catch(error) {
            res.status(500).json({"message": "Error while searching movies."})
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

/**
 * Authors tool for adding movies to the database.
 */
/*
app.post('/saveDataToDb', function(req, res) {

    // get JSON-object from the http-body
    let jsonObj = req.body;

    // Check if there is something to be added.
    if (!util.isNull(jsonObj)) {

        // All variables except numbers have semi-colons added for sql purposes. ex. String must be type -> 'String', this is not allowed -> String.
        let name = `'` + jsonObj.Title + `'`;
        let year = jsonObj.Year;
        let imageID = `'` + jsonObj.imdbID + `'`;

        // Movies runtime must be converted from string to a float.
        let runtimeToFloat = parseFloat(jsonObj.Runtime).toFixed(2);
        let runtimeMin;

        // We want to double check that the value is a number.
        if (isNaN(runtimeToFloat)) {
            runtimeMin = 0.00;
        } else {
            runtimeMin = runtimeToFloat;
        }

        let genre = `'` + jsonObj.Genre + `'`;
        let director = `'` + jsonObj.Director + `'`;
        let actor = `'` + jsonObj.Actors + `'`;
        let plot = `'` + jsonObj.Plot + `'`;
        let poster = `'` + jsonObj.Poster + `'`;

        // IIFE, insert the data to database. Send response to client according to success/failure.
        (async () => {
            try {
                let sql = `INSERT INTO movie(name, year, imageID, runtimemin, genre, director, actors, plot, poster)` +
                    ` VALUES(` + name + `, ` + year + `, ` + imageID + `, `
                    + runtimeMin + `, ` + genre + `, ` + director + `, `
                    + actor + `, ` + plot + `, ` + poster + `)`;
                await client.query(sql);

                res.send('Succesfully saved data to database');

            } catch (error) {
                console.log(error);
                res.send('Couldn\'t save data to database');

            }
        })();
    }
});
*/

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
    const isUsernameValid = validateCredential(username);
    const isPasswordValid = validateCredential(password);
    const isEmailValid = validateEmail(email);

    // Check validations one more time.
    if(isUsernameValid && isPasswordValid && isEmailValid) {

        // 2. Hashes the password
        const hashPass = bcrypt.hashSync(password, 12);
        const pass = hashPass; // String of password for db

        // 3. Check if username already exists and acts accordingly.
        (async () => {
            try {
                // 4. Checks if the username already exists.
                const checkQuery = `SELECT username FROM users WHERE username =$1`;
                const results = await client.query(checkQuery, [username]);

                // 5. If username does not exists -> save the user to database & send a 201(CREATE) status code with message.
                if(JSON.stringify(results.rows).length < 3) {
                    const insertQuery = `INSERT INTO users(username,password,user_level,email) VALUES($1, $2, $3)`;
                    await client.query(insertQuery, [username, pass, email]);
                    res.status(201).json({"message": "Account was successfully created!"})
                }

                // 6. If the username is taken sends a string of information about it as response.
                else {
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

/* send reset password link in email */
app.post('/api/reset-password', function(req, res) {

    const email = req.body.data.email;

    (async () => {
        try {
            // Check if email exists.
            let results = await client.query(`SELECT * FROM users WHERE email =$1`, [email]);
            let user = results.rows;

            let type = '';
            let msg = '';


            // results.rows.length possibly
            if (user.length > 1) {

                let token = randomToken.generate(20);

                let sent = sendEmail(email, token); // Send email to the email that was given.

                if (sent) {
                    let data = {
                        token: token
                    }

                    // If the email was sent we update that users token attribute on database.
                    client.query('UPDATE users SET token=$1 WHERE email =$2', [data, email]);
                    type = 'success';
                    msg = 'The reset password link has been sent to your email address';

                } else {
                    type = 'error';
                    msg = 'Something goes to wrong. Please try again';
                }

            } else {
                type = 'error';
                msg = 'The Email is not registered with us';
            }
            res.send(200).json({type, msg})
        } catch (err) {
            res.send("There was an error");
        }
    })();
});

// Validates email, accepts simple format  xxx@yyy.zzz
function validateEmail(email) {
    const regex = ".+\\@.+\\..+";
    let pattern = new RegExp(regex);
    return pattern.test(email);
}

// Validates credential(username & password).
function validateCredential(credentialToValidate) {
    // Regex accepts usernames and passwords that contain 4-20 characters that contain only letters and numbers.
    let regex = /^[a-zA-Z0-9]{4,20}$/;
    let pattern = new RegExp(regex);
    return pattern.test(credentialToValidate);
}



/*
import nodemailer from "nodemailer";
async function sendEmail(emailAddress, usersToken) {
    let send = false;

    let email = emailAddress;
    let token = usersToken;

    let mail = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME, // Your email id
            pass: process.env.EMAIL_PASSWORD // Your password
        }
    });

    let mailOptions = {
        from: 'mymovies.noreply@gmail.com',
        to: email,
        subject: 'Reset Password Link - My Movies',
        html: '<p>You requested for reset password, kindly use this <a href="https://tatukristiani.github.io/reset-password?token=' + token + '">link</a> to reset your password</p>'

    };

    await mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(1)
        } else {
            console.log(0)
        }
    }).then(r => {
        console.log(r);
        return send;
    });

    return send;
}
*/

/*
// Test routes & functions for school
function authenticateToken(req,res,next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, secret, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}
*/
// Test for school
/*
app.post('/api/event', authenticateToken, urlencodedParser, function(req,res) {

    res.send("user (decoded) " + JSON.stringify(req.user));

})
*/

const port = process.env.PORT || 4000;
app.listen(port, ()=>{
    console.log('Listening at port https://moviesoftwareapi.herokuapp.com:%s', port);
});
