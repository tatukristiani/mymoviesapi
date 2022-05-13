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
const { google } = require('googleapis');

const CLIENT_ID = '612069027869-t5bqovbq134udrrn8n8h2sbbkj5i3vam.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//044NIk04F759_CgYIARAAGAQSNwF-L9IrotZCrb2GJV0cUSnHQityHQ_zXR9dOoZPC5maeDdgkx6wqrnnkRKt3-apPlIo2_4WTsg';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Documentation: https://swagger.io/specification/#infoObject
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'My Movies API',
            version: "1.0.0",
            description: "This is a sample of the REST API server that runs on heroku. Here you can view all the available routes for the API",
            contact: {
                name: "Creator",
                email: "mymovies.noreply@gmail.com"
            },
        },
        servers: [
            {
                "url": "https://notRealServerInUseSorry",
                "description": "No real server in use, for database security reasons"
            }
        ]
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
 *         username: username
 *         email: example@email.com
 *
 *     Movies:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           adult:
 *             type: boolean
 *           backdrop_path:
 *             type: string
 *           media_type:
 *             type: string
 *           id:
 *             type: integer
 *           genre_ids:
 *             type: array
 *           original_language:
 *             type: string
 *           original_title:
 *             type: string
 *           overview:
 *             type: string
 *           popularity:
 *             type: number
 *           poster_path:
 *             type: string
 *           release_date:
 *             type: string
 *           title:
 *             type: string
 *           video:
 *             type: boolean
 *           vote_average:
 *             type: number
 *           vote_count:
 *             type: number
 *         example:
 *           adult: false
 *           backdrop_path: "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg"
 *           media_type: "movie"
 *           id: 634649
 *           genre_ids: [28,12,878]
 *           original_language: "en"
 *           original_title: "Spider-Man: No Way Home"
 *           overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man."
 *           popularity:  5596.919
 *           poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
 *           release_date: "2021-12-15"
 *           title: "Spider-Man: No Way Home"
 *           video:  false
 *           vote_average: 8.3
 *           vote_count: 8613
 *
 *     UserMovies:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           id:
 *             type: integer
 *           title:
 *             type: string
 *           date:
 *             type: string
 *           tmdbid:
 *             type: integer
 *           runtime:
 *             type: integer
 *           genres:
 *             type: string
 *           overview:
 *             type: string
 *           poster_path:
 *             type: string
 *           trailerid:
 *             type: string
 *         example:
 *           id: 1
 *           title: "Spider-Man: No Way Home"
 *           date: "2021-12-15"
 *           tmdbid: 634649
 *           runtime: 148
 *           genres: "Action, Adventure, Science Fiction"
 *           overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man."
 *           poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
 *           trailerid: "WgU7P6o-GkM"
 *
 *     UserMoviesPost:
 *       type: object
 *       required:
 *         - title
 *         - tmdbid
 *         - posterpath
 *         - date
 *         - runtime
 *         - overview
 *         - trailerid
 *         - genres
 *         - user
 *       properties:
 *         title:
 *           type: string
 *         tmdbid:
 *           type: integer
 *         posterpath:
 *           type: string
 *         date:
 *           type: string
 *         runtime:
 *           type: integer
 *         overview:
 *           type: string
 *         trailerid:
 *           type: string
 *         genres:
 *           type: string
 *         user:
 *           type: string
 *       example:
 *         title: "Joker"
 *         tmdbid: 367365
 *         posterpath: "/4jdsfujewgfj333f3.jpg"
 *         date: "2021-12-15"
 *         runtime: 156
 *         overview: "Overview of Joker movie"
 *         trailerid: "whU79sj_fh"
 *         genres: "Drama, Action, Horror"
 *         user: "RandomUsername"
 */

// Swagger Tags
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Requests for user information.
 *
 *   name: Movies
 *   description: Requests for movies
 *
 *   name: Authentication
 *   description: Requests involving authentication
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
 *                 $ref: '#/components/schemas/Users'
 *
 *       404:
 *          description: User not found!
 *
 *
 *       500:
 *          description: Problems with the database.
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


/**
* @swagger
* /api/users:
*   post:
*     summary: Updates users username and email
*     tags: [Users]
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             example: {
*                 newUsername: newUsername,
*                 username: username,
*                 email: test@email.com
*             }
*       required: true
*       description: Object with users old username, new username and email
*     responses:
*       200:
*         description: Successfully updated user credentials!
*       409:
*          description: Please choose another username!
*       500:
*          description: Error while trying to update user credentials.
*       400:
*          description: Error on the passed information!
*       404:
*          description: Invalid credentials!
*
*/

app.post('/api/users', function(req,res){
    let data = req.body;

    let newUsername = data.newUsername;
    let username = data.username;
    let email = data.email;

    const validEmail = validateEmail(email);
    const validUsername = validateCredential(newUsername);

    if(validEmail && validUsername) {
        (async () => {
            try {
                let result = await client.query(`SELECT username FROM users WHERE username=$1`, [newUsername]);
                if(result.rows.length < 1) {
                    result = await client.query(`SELECT username FROM users WHERE username=$1`, [username]);
                    if(result.rows.length > 0) {
                        await client.query(`UPDATE users SET username=$1, email=$2 WHERE username=$3`, [newUsername, email, username]);
                        res.status(200).json({"message": "Successfully updated user credentials!"});
                    }
                    res.status(404).json({"message": "Invalid credentials!"});
                } else {
                    res.status(409).json({"message": "Please choose another username!"});
                }
            } catch (err) {
                res.status(500).json({"message": "Error while trying to update user credentials."});
            }
        })();
    } else if(validEmail){
        res.status(400).json({"message":"Username must be 4-20 characters & can't start or end with a . or _ or have two of them in a row!"});
    } else {
        res.status(400).json({"message":"Email address must be a valid email! i.e. example@email.com"});
    }

})


/**
 * @swagger
 * /api/movies/trending:
 *   get:
 *     summary: Retrieve trending movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: Page number
 *     responses:
 *       200:
 *         description: Successfully retrieved movies NOTE! Example output array has 1 object, normally there would be many!
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Movies'
 *       404:
 *          description: No movies found!
 *
 *
 *       500:
 *          description: Error getting movies
 *
 */

app.get('/api/movies/trending', urlencodedParser, (req,res) => {
    const urlQuery = url.parse(req.url, true).query;
    const page = urlQuery.page;

    (async () => {
        try {
            request(requests.fetchTrending + page, function(error, response, body) {
                let movies = JSON.parse(body).results;
                if(movies.length >= 1) {
                    res.status(200).json(movies);
                } else {
                    res.status(404).json({"error": "No movies found!"})
                }
            });
        } catch(error) {
            res.status(500).json({"message": "Error getting movies"})
        }
    })();
});


/**
 * @swagger
 * /api/movies/genre:
 *   get:
 *     summary: Retrieve movies by genre
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: genre
 *         required: true
 *         description: Genre code
 *         schema:
 *           type: integer
 *           example: 28
 *       - in: query
 *         name: page
 *         required: true
 *         description: Page number
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved movies NOTE! Example output array has 1 object, normally there would be many!
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Movies'
 *       404:
 *          description: No movies found!
 *
 *
 *       500:
 *          description: Error getting movies
 *
 */

app.get('/api/movies/genre', urlencodedParser, (req,res) => {
    const urlQuery = url.parse(req.url, true).query;
    const genre = urlQuery.genre;
    const page = urlQuery.page;

    (async () => {
        try {
            request(requests.fetchMoviesByGenre + genre + "&page=" + page, function (error, response, body) {
                let movies = JSON.parse(body).results;
                if (movies.length >= 1) {
                    res.status(200).json(movies);
                } else {
                    res.send(404).json({"error": "No movies found!"})
                }
            });
        } catch(error) {
            res.status(500).json({"message": "Error getting movies"})
        }
    })();
});


/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Search a movie by its title.
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         description: Movie title / Movie name
 *         schema:
 *           type: string
 *           example: "Joker"
 *     responses:
 *       200:
 *         description: Found search results. NOTE! The resulted objects title would have the search parameter in the title. Current example is just an example!
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Movies'
 *       204:
 *          description: No movies found with the given input!
 *
 *
 *       500:
 *          description: Error while searching movies.
 *
 */

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
                    res.status(204).json({"message": "No movies found with the given input!"});
                }
            });
        } catch(error) {
            res.status(500).json({"message": "Error while searching movies."});
        }
    })();
});


/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Fetch all movies that the user has saved to database.
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: user
 *         required: true
 *         description: Username of the user
 *         schema:
 *           type: string
 *           example: ExampleUsername
 *     responses:
 *       200:
 *         description: Return an array of movie objects. If the username doesn't exist, then the array is empty.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UserMovies'
 *
 */

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


/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Saves movie information to database according to the user credentials.
 *     tags: [Movies]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            $ref: '#/components/schemas/UserMoviesPost'
 *
 *     responses:
 *       201:
 *         description: Movie successfully added to your movies!
 *
 *       409:
 *         description: User already has this movie in their database.
 *
 *       400:
 *         description: There is some type of problem with the given data.
 *
 */
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


/**
 * @swagger
 * /api/movies:
 *   delete:
 *     summary: Deletes specified movie from the users database.
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: user
 *         required: true
 *         description: Username
 *         schema:
 *           type: string
 *           example: ExampleUsername
 *       - in: query
 *         name: title
 *         required: true
 *         description: Title of the movie
 *         schema:
 *           type: string
 *           example: "Joker"
 *       - in: query
 *         name: tmdbid
 *         required: true
 *         description: tmdbid number
 *         schema:
 *           type: integer
 *           example: 573484
 *
 *     responses:
 *       200:
 *         description: Movie successfully removed.
 *
 *       404:
 *         description: Problems removing the movie.
 *
 */
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
 * @swagger
 * /api/login:
 *   post:
 *     summary: Route for authenticating user credentials when logging in
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - username
 *              - password
 *            properties:
 *              username:
 *                type: string
 *                example: "ExampleUsername"
 *              password:
 *                type: string
 *                example: "ExamplePassword123"
 *
 *     responses:
 *       200:
 *         description: User credentials authenticated.
 *
 *       401:
 *         description: Invalid credentials.
 *
 *       500:
 *         description: Problems with the database.
 *
 */

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
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registers an account with the given credentials.
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - username
 *              - password
 *              - email
 *            properties:
 *              username:
 *                type: string
 *                example: "ExampleUsername"
 *              password:
 *                type: string
 *                example: "ExamplePassword123"
 *              email:
 *                type: string
 *                example: "example@email.com"
 *
 *     responses:
 *       201:
 *         description: Account was successfully created!
 *
 *       403:
 *         description: Account can't be created with the given data, reason might be invalid or taken.
 *
 *       500:
 *         description: Problems with the database.
 *
 */

app.post('/api/register', function(req, res) {
    // Reveice all neede data from request body.
    const dataReceived = req.body;
    const username = dataReceived.username;
    const password = dataReceived.password;
    const email = dataReceived.email;
    const userLevel = 'user';
    const isUsernameValid = validateCredential(username);
    const isPasswordValid = validatePassword(password);
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

/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Sends a reset password link through email for the user on success.
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *                example: "example@email.com"
 *
 *     responses:
 *       200:
 *         description: Email is sent only if the account exist.
 *
 *       500:
 *         description: Problems with the database.
 *
 */

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

                // Send email to the email that was given.
                await sendEmail(email, token)
                    .then((result) => console.log("Email sent...", result))
                    .catch((error) => console.log(error.message));

                // If the email was sent we update that users token attribute on database.
                client.query(`UPDATE users SET token=$1 WHERE email=$2`, [token, email]);
                type = 'success';
                msg = 'Email successfully sent to' + email + ". Copy the Token from that email to reset your password.";
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
            res.status(500).json(response);
        }
    })();
});

// Updates the password that needed resetting.

/**
 * @swagger
 * /api/update-password:
 *   post:
 *     summary: Registers an account with the given credentials.
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - token
 *              - password
 *            properties:
 *              token:
 *                type: string
 *                example: "UAJUIOJauhJIHNyhgb8uyah87d78HJSD70A38998HJB89B"
 *              password:
 *                type: string
 *                example: "NewUpdatedPasswordExample123"
 *
 *     responses:
 *       200:
 *         description: Password has been changed if the needed credentials match.
 *
 *       500:
 *         description: Error when trying to update password.
 *
 */

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
            res.status(500).json("Error while updating password, sorry about this.")
        }
    })();
});


// Validates email, accepts simple format  xxx@yyy.zzz
function validateEmail(email) {
    const regex = ".+\\@.+\\..+";
    let pattern = new RegExp(regex);
    return pattern.test(email);
}

// Validates username. Length must be between 4-20.
function validateCredential(credentialToValidate) {
    // Regex accepts usernames that contain 4-20 characters that contain only letters and numbers.
    let regex = /^[a-zA-Z0-9]{4,20}$/;
    let pattern = new RegExp(regex);
    return pattern.test(credentialToValidate);
}

function validatePassword(password) {
    return password.length >= 4 && password.length <= 20;
}

async function sendEmail(emailAddress, usersToken) {

    try {
        const accessToken = await oAuth2Client.getAccessToken();

        let email = emailAddress;
        let token = usersToken;

        const mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USERNAME,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        const mailOptions = {
            from: 'My Movies <process.env.EMAIL_USERNAME>',
            to: email,
            subject: 'Password reset - My Movies',
            html: '<h1>Dear User Of My Movies</h1>' +
                '<br>' +
                '<p>Request for a password reset was made for this account on My Movies. Please use the Token provided here to reset your password.</p>' +
                '<p>Token:' + token + '</p>' +
                '<br><p>Sincerely My Movies Team</p>'
        };

        const result = await mail.sendMail(mailOptions);
        return result;
    } catch(error) {
        return error;
    }
}


const port = process.env.PORT || 4000;
app.listen(port, ()=>{
    console.log('Listening at port https://moviesoftwareapi.herokuapp.com:%s', port);
});
