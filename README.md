# Capstone Project - Daily Tenant

## Website Link
[CLICK HERE FOR THE LIVE DEMO](https://dailytenant.herokuapp.com/)


## Overview
### Ideas
Landlords trying to communicate with their tenants is slow and has no guarantee to reach everyone. 
Hassle for tenants to try to contact their landlords who may only be available at certain times.
Therefore, we created this website, which is a new way for landlords and tenants to interact with each other about home-related information.

### Architecture
![architecture](https://user-images.githubusercontent.com/58491408/146209424-ace0699a-1bb7-4f43-939d-6c4509e082a8.png)

### Goals
1. Register and login to an account.
2. Email verification. 
3. Password reset. 
4. Create a building list on the landlord side. 
5. Find and filter the building lists on the tenant side. 
6. Request and schedule a repair request on the tenant side. 
7. Drag and drop to upload an image. 
8. Add additonal comments or cancel the request on the tenant side. 
9. Post an announcement that is viewable by all tenants and landlords. 
10. Send email notifications to the tenants whenever the landlords make an update. 
11. Delete the tenants or buildings on the landlord side. 

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

### Environment/Frameworks
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Dependencies
- ODM library for MongoDB
  - mongoose
- For emails
  - nodemailer
  - Google APIs
    - OAuth2
- For passwords
  - bcrypt
- For authentications
  - passport
- For repairs
  - gridFS
  - multer
  - socket.io
- For development
  - nodemon
  - dotenv

## Run on local machine
### 1. Clone the project
### 2. Have Node.js installed
### 3. Install npm
### 4. `npm start`
