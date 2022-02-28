const { Client } = require('pg');

const client = new Client({
    user: "fcncirfhfkwocb",
    password: "16f2e54ffe015bf368889c50d4574bbf7028dc1bfa4e9d4b436c0caf129ec1f4",
    host: "ec2-54-172-219-6.compute-1.amazonaws.com",
    port: 5432,
    database: "ddhdsglt7t3ubs"
})

client.connect(function(error) {
    if(!error) {
        console.log(error);
    } else {
        console.log("Connected!:)");
    }
});


module.exports = client;
