var mailerhbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'mail.webiste.com',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: 'support@webiste.com',
        pass: 'nonmedical@123'
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Status App" <noreply@website.com>', // sender address
    to: 'bar@website.com, baz@website.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    // text: 'Hello world ?', // plain text body
    // html: '<b>Hello world ?</b>' // html body
};

function sendMail(to, subject, template , context = '') {
    mailOptions.to = to;
    mailOptions.subject = subject;
    mailOptions.template = template;
    mailOptions.context = context;
    transporter.sendMail(mailOptions, (error, info) => {
        //console.log(error, info);
    });
}


module.exports = {
    sendMail
}