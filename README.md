# Capstone Project - Daily Tenant

## Website Link
[CLICK HERE FOR THE LIVE DEMO](https://dailytenant.herokuapp.com/)


## Overview
### Ideas
Landlords trying to communicate with their tenants is slow and has no guarantee to reach everyone. 
Hassle for tenants to try to contact their landlords who may only be available at certain times.
Therefore, we created this website, which is a new way for landlords and tenants to interact with each other about home-related information.

### Goals
- Register and login to an account.
- Email verification. 
- Password reset. 
- Create a building list on the landlord side. 
- Find and filter the building lists on the tenant side. 
- Request and schedule a repair request on the tenant side. 
- Drag and drop to upload an image. 
- Add additonal comments or cancel the request on the tenant side. 
- Post an announcement that is viewable by all tenants and landlords. 
- Send email notifications to the tenants whenever the landlords make an update. 
- Delete the tenants or buildings on the landlord side. 

### Challenges and Lessons Learned
1. How to store and retrieve images.
2. Getting the drap and drop features done.
3. Implementing Progressive Web Apps (PWAs) and push notifications.
4. Too much useless css code.

## Tools/Technologies
### Languages
- HTML
- CSS
- Javascript

### View Engine
- EJS

### Frontend / Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Dependencies
- socket.io (for repairs)
- bcrypt (for passwords)
- gridFS (for repairs)
- mongoose (ODM library for MongoDB)
- nodemailer (for emails)
- passport (for authentication)
- Google APIs (OAuth2, for emails)
- multer (for repairs)
- nodemon (for development)
- dotenv (for development)

## Run on local machine
### 1. Clone the project
### 2. Have Node.js installed
### 3. Install npm
### 4. `npm start`
