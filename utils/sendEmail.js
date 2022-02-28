
/* Template for sending email to the given email & add the token to the link on the email for security*/
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

module.exports = sendEmail;