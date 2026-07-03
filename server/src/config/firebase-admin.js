const admin = require('firebase-admin');

let db;
let auth;

if (process.env.NODE_ENV === 'test') {
  db = {
    collection: () => ({
      doc: () => ({
        set: async () => {},
        update: async () => {},
      }),
    }),
  };

  auth = {
    verifyIdToken: async () => ({
      uid: 'test-user',
    }),
  };

  module.exports = {
    admin: {},
    db,
    auth,
  };
} else {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });

    console.log('✅ Firebase Admin initialized');
  }

  db = admin.firestore();
  auth = admin.auth();

  module.exports = { admin, db, auth };
}
