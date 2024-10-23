const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = require('../service_account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const adminAuth = admin.auth();

module.exports = { admin, adminAuth };
