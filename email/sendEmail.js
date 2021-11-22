const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { gmail } = require('googleapis/build/src/apis/gmail');

const CLIENT_ID = '762539378287-dqn6e07kc3lhc6mj9tmunqqduc245hre.apps.googleusercontent.com';
const CLIENT_SECRET = 'mILg4spXiS8EcYpBtPqVbDiN';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04B6Rsi38I57kCgYIARAAGAQSNwF-L9Ir2D250OFUnoP4C5KrLBPqx2WnGdcSlmu9MUma0MYfGKHpO9ZDvWfAKxpDo_Bp4vRVAn4';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(options){
    console.log("EMAIL SENT...");
    try{
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'capstoneprojFall21@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });
        const result = await transport.sendMail(options);
        return result;

    }catch (error) {
        console.log(error);
        return error;
    }
}

function sendMessage(name,recipient,subject,text){
    const mailOptions = {
        from: name,
        to: 'capstoneprojFall21@gmail.com',
        subject: subject+' ('+name+')',
        text: 'Email: '+recipient+'\n'+text,
        //html: html,
    };
    sendEmail(mailOptions);
}

function subMail(subname,subemail){
    const subOptions = {
        from: 'The Daily Tenant <capstoneprojfall21@gmail.com>',
        to: subemail,
        subject: 'Welcome to The Daily Tenant',
        text: 'Hello '+subname.toUpperCase()+'!\n\nYou are now subscribed to receive email notification on new accouncements and updates!',
        attachments: [{
            filename: 'how-to-screen-a-tenant-hero.jpg',
            path: "https://www.mysmartmove.com/sites/SmartMove/blog/assets/img/post-hero/how-to-screen-a-tenant-hero.jpg",
            cid: "how-to-screen-a-tenant-hero.jpg"
        }],
        //html: html,
    };
    sendEmail(subOptions);
}

function sendUpdate(email,subject,text){
    const today = new Date()
    const upOptions = {
        from: 'The Daily Tenant <capstoneprojfall21@gmail.com>',
        to: email,
        subject: "New Announcement: "+subject,
        text: today.toLocaleDateString() + "\n" + text,
        //html: html,
    };
    sendEmail(upOptions);
}

//new code 
function sendVerification(email,code) {
    let link = `localhost:3000/confirmation/${code}`;
    const verOptions = {
        from: 'The Daily Tenant <capstoneprojfall21@gmail.com>',
        to: email,
        subject: "Email Verification Link",
        text: 'Click this link to verify your email',
        html: `<a href="${link}">${link}</a>`
    }
    console.log(email)
    console.log(link);
    sendEmail(verOptions);
}
//

/*
sendMail().then((result) => console.log('Email sent...', result)).catch((error) => console.log(error.message));
const toEmail = "huangtoby90@gmail.com";
const subject = "TESTING EMAIL";
const text = "NOTHING HERE";
const html = "<h1>Hello there!</h1>";
sendMail(toEmail,subject,text).then((result) => console.log('Email sent', result));
*/

module.exports.sendMessage = sendMessage;
module.exports.subMail = subMail;
module.exports.sendUpdate = sendUpdate;
module.exports.sendVerification = sendVerification;
