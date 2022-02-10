// Kurssin muuttujat Access token json varten

const jwt = require('jsonwebtoken');
const secret = "fOzHnFjg0FmM6O/dTVXd/4sGqxgkBdcNwNp00J+QYxm6WljQui0i1Uwk0yp70fQEVIVKNUqM8vYqYgUDWeO0w/GsjgH0QuaoyfbSoHWLrrrIFwIvQR7V7zm535HaOnHzC6QmKElDneqU1MMGPFDxepGD5TaRZ+uGVdhYg26s/azEngpf+FKNJTZYAXebx/ByAmdVhIuVIRok0NJLLZZe/njZOh7jBdcOJZq7GBedTASSdpK7CgKtplE8PwGQ8QrPhiW5besygWKuoDF90ap591+/vN1lMCEam6KfBPxi9D1GTjUMe5cjgpz34NvqP9+sXns+UkejzY5tqBdstl64VQ==";

//const url = require('url');
//const util = require('util');
const express = require('express');
const process = require('process');
const { Client } = require('pg');
const cors = require('cors'); // For all access for all domains.
const request = require('request'); // For external API calls.
const bcrypt = require('bcryptjs'); // Password hash crypt.
const requests = require('./movieAPI/request');
let port = process.env.PORT || 3000;


const app = express();
app.use(express.json());
app.use(cors());

/*
app.use(function(req,res,next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
})
 */

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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


/**
 * Gets all movies from the database table "movie"
 */
app.get('/home', (request, response) => {
    console.log('Home page opened');
    (async () => {
        try {
            let results = await client.query("SELECT * FROM movie");
            let data = JSON.stringify(results.rows);
            console.log("Data received")
            response.send(data);
        } catch(err) {
            console.log("Database error!" + err);
        }

    })();
});

app.get('/api/home', (req,res) => {

    (async () => {
        try {
            request(requests.fetchActionMovies, function(error, response, body) {
                //console.log(body);
                //console.log('Search with year completed.');
                res.send(body);
            });
        } catch(error) {
            res.status(500).json({"message": "error getting movies"})
        }
    })();
});

/**
 * Searches for a movie from the omdbAPI with the users given title and year(optional).
 * This function finds only 1 movie MAX.
 */
/*
app.get('/search', function(req, res) {
    console.log('Searching movie from external API');
    var q = url.parse(req.url, true).query;
    var movieName = q.name;
    var movieYear = parseInt(q.year);
    console.log('Movie name: ' + movieName + ' MovieYear: ' + movieYear);

    // Check if we have year input from the user, if we got one then we perform a search with it.
    if (movieYear != null && !isNaN(movieYear) && movieYear > 0 && movieYear <
        9999) {
        request('http://www.omdbapi.com/?t=' + movieName + '&y=' + movieYear +
            '&apikey=1376e1b1', function(error, response, body) {
            console.log(body);
            console.log('Search with year completed.');
            res.send(body);
        });
    }

    // If user didn't add a year to the search bar, then we don't use it.
    else {
        request('http://www.omdbapi.com/?t=' + movieName + '&apikey=1376e1b1',
            function(error, response, body) {
                //console.log(body);
                console.log('Search without year completed!');
                res.send(body);
            });
    }
});

*/


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

app.post('/api/login', function(req, res) {
    const data = req.body;
    const username = data.username; // String of username
    const password = data.password; // String of password

    // Check from database if user is valid
    (async () => {
        try {
            const checkQuery = `SELECT username, password FROM users WHERE username =` + `'` + username + `'`;
            const results = await client.query(checkQuery);
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
 * Checks if the users given username and password are indeed correct.
 */

app.post('/accountValidate', function(req, res) {
    const dataReceived = req.body;
    const username = dataReceived.username; // String of username
    const password = dataReceived.password; // String of password

    // Check from database if user is valid
    (async () => {
        try {
            const checkQuery = `SELECT username, password FROM users WHERE username =` + `'` + username + `'`;
            const results = await client.query(checkQuery);
            const rows = results.rows;

            // Should give 1 row of data if user is registered.
            if(rows.length > 0) {
                const usernameDB = rows[0].username;
                const passwordDB = rows[0].password;

                // Compares the inserted password to the one in database.
                bcrypt.compare(password,passwordDB, function(error,response) {
                    if(response && usernameDB == username) {
                        const accessToken = jwt.sign({username: username}, secret, {expiresIn: "1h"}); // Access Token
                        //res.send(true);
                        res.status(202).json({accessToken: accessToken}); // Access Token
                    } else {
                        res.send(false);
                    }
                })
            } else {
                res.send(false);
            }
        } catch (error) {
            console.log(error);
            res.send(false);
        }
    })();
});


/**
 * Creates an account for the user.
 * Hashes the password and check the correct validation of the username/password.
 */
app.post('/api/register', function(req, res) {
    const dataReceived = req.body;
    const username = dataReceived.username;
    const password = dataReceived.password;
    const email = dataReceived.email;
    const isUsernameValid = validateCredential(username);
    const isPasswordValid = validateCredential(password);
    const isEmailValid = validateEmail(email);

    // 1. Validates username & password
    if(isUsernameValid && isPasswordValid && isEmailValid) {

        // 2. Hashes the password
        const hashPass = bcrypt.hashSync(password, 12);
        const pass = hashPass; // String of password for db

        // 3. Check if username already exists and acts accordingly.
        (async () => {
            try {
                // 4. Checks if the username already exists.
                const checkQuery = `SELECT username FROM users WHERE username =` + `'` + username + `'`;
                const results = await client.query(checkQuery);

                // 5. If username does not exists -> save the user to database & send a boolean value of true as response.
                if(JSON.stringify(results.rows).length < 3) {
                    const insertQuery = `INSERT INTO users(username,password,user_level,email) VALUES(` + `'` + username + `' , '` + pass + `', 'user' , '` + email + `')`;
                    await client.query(insertQuery);
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

// Validates email, accepts simple format  xxx@yyy.zzz
function validateEmail(email) {
    const regex = ".+\\@.+\\..+";
    let pattern = new RegExp(regex);
    return pattern.test(email);
}

// Validates credential(username & password).
function validateCredential(credentialToValidate) {
    // Regex used won't accept strings that start/end with a . or _ or have two of them in a row
    // Length of string must be at least 4 characters and MAX 20 characters.
    let regex = "^(?=.{4,20}$)(?:[a-zA-Z\\d]+(?:(?:\\.|-|_)[a-zA-Z\\d])*)+$";
    let pattern = new RegExp(regex);
    return pattern.test(credentialToValidate);
}



/**
 * Saves the movies data to the users database. Finds the movies data from the external API.
 */
/*
app.post('/saveMovieToDb', urlencodedParser, function(req, res) {
    console.log("Saving movie to users database.");

    var q = url.parse(req.url, true).query;

    let movieName = q.name;
    let movieYear = parseInt(q.year);
    let username = q.user;
    let uri = 'http://www.omdbapi.com/?t=' + movieName + '&y=' + movieYear +
        '&apikey=1376e1b1';
    let jsonObj;

    // Variables for saving the movie to database.
    let name;
    let year;
    let imageID;
    let runtimeToFloat;
    let genre;
    let director;
    let actor;
    let plot;
    let poster;

    // We get the movies information from the API
    request(uri, function(error, response, body) {
        //console.log('Server response: ' + body);
        jsonObj = JSON.parse(body);

        let jsonPlot = jsonObj.Plot.replace(/'/g, '');
        let jsonTitle = jsonObj.Title.replace(/'/g,'');

        // Variables for saving the movie to database.
        name = `'` + jsonTitle + `'`;
        year = jsonObj.Year;
        imageID = `'` + jsonObj.imdbID + `'`;
        runtimeToFloat = parseFloat(jsonObj.Runtime).toFixed(2);
        genre = `'` + jsonObj.Genre + `'`;
        director = `'` + jsonObj.Director + `'`;
        actor = `'` + jsonObj.Actors + `'`;
        plot = `'` + jsonPlot + `'`;
        poster = `'` + jsonObj.Poster + `'`;

        let searchUser = `'` + username + `'`;
        let userID; // For the users ID.
        let movieID; // For the movies ID.

        // Check if the movie is in database. If it's not add it.
        (async () => {
            try {
                // Check if the movie is already in the database.
                let sql = `SELECT * FROM movie WHERE name =` + name + ` AND year = ` + year;
                let result = await client.query(sql);
                let rows = result.rows;

                // If the movie is not in database, we save it there.
                if (rows.length < 1) {
                    // Add movie to database
                    sql = `INSERT into movie(name,year,imageID,runtimeMin,genre,director,actors,plot,poster)`
                        + ` VALUES(` + name + `, ` + year + `, ` + imageID + `, `+
                        runtimeToFloat + `, ` + genre + `, ` + director + `, ` + actor +
                        `, ` + plot + `, ` + poster + `)`;
                    await client.query(sql);
                }

                // Search for usernames ID
                sql = `SELECT id FROM users WHERE username = ` + searchUser;
                result = await client.query(sql);
                userID = result.rows[0].id;

                // Search for movies ID
                sql = `SELECT id FROM movie WHERE name = ` + name + ` AND year = ` +
                    year;
                result = await client.query(sql);
                movieID = result.rows[0].id;

                // First we check if the movie is already in the users database.
                sql = `SELECT * FROM user_movie WHERE userID = ` + userID + ` AND movieID = ` + movieID;
                let confirmMovieDoesntExists = await client.query(sql);

                // If we found out that the user doesn't have this movie we save it.
                if(confirmMovieDoesntExists.rows.length < 1) {

                    // Then add this movie to the user_movie table.
                    sql = `INSERT INTO user_movie(userID,movieID) VALUES(` + userID +
                        `, ` +
                        movieID + `)`;
                    await client.query(sql);
                    res.send(movieName + ' successfully added to your movies!');
                }
                else {
                    res.send("You already have " + movieName + " added to your movies.");
                }
            } catch (error) {
                console.log(error);
                res.send('Couldn\'t add ' + movieName + ' to your movies.');
            }
        })();
    });
});

*/


/**
 * Finds all movies that the user has on the database.
 */
/*
app.get('/mymovies', urlencodedParser, function(req, res) {
    var q = url.parse(req.url, true).query;
    let user = `'` + q.user + `'`;

    (async () => {
        try {
            let sql = `SELECT * FROM movie WHERE movie.id IN (SELECT movieID FROM user_movie WHERE userID IN (SELECT users.id FROM users WHERE username = ` + user + `))`;
            let result = await client.query(sql);
            let jsonObj = result.rows;
            res.send(jsonObj);
        }catch(error) {
            console.log(error);
            res.send(false);
        }
    })()
});
*/


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

app.post('/api/event', authenticateToken, urlencodedParser, function(req,res) {

    res.send("user (decoded) " + JSON.stringify(req.user));

})



app.listen(port, ()=>{
    console.log('Listening at port https://moviesoftwareapi.herokuapp.com:%s', port);
});
