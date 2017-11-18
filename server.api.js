const config = require('./config')
const serviceAccount = require('./service-account.json')

const Axios = require('axios')
const Boom = require('boom')
const FirebaseAdmin = require('firebase-admin')
const Hapi = require('hapi')
const Inert = require('inert')
const Oauth2 = require('simple-oauth2').create(config.slackCredentials)
const Path = require('path')

module.exports = (PORT) => {
  const server = new Hapi.Server()
  
  FirebaseAdmin.initializeApp({
    credential: FirebaseAdmin.credential.cert(serviceAccount),
    databaseURL: config.firebase.databaseURL
  })
  
  server.connection({
    host: 'localhost',
    port: PORT
  })
  
  function createFirebaseAccount(accessToken, slackUserID, userName, profilePic) {
    const uid = `slack:${slackUserID}`;
    
    const databaseTask = FirebaseAdmin.database().ref(`/slackAccessToken/${uid}`).set(accessToken);
    
    const userCreationTask = FirebaseAdmin.auth().updateUser(uid, {
      displayName: userName,
      photoURL: profilePic
    }).catch((error) => {
      if (error.code === 'auth/user-not-found') {
        return FirebaseAdmin.auth().createUser({
          uid: uid,
          displayName: userName,
          photoURL: profilePic
        })
      }
      throw error
    });
    
    return Promise.all([userCreationTask, databaseTask]).then(() => {
      return FirebaseAdmin.auth().createCustomToken(uid).then((firebaseToken) => {
        return firebaseToken
      })
    })
  }
  
  const provision = async () => {
    await server.register(Inert)
  
    server.route({
      method: 'GET',
      path: '/api/slack-callback',
      handler: (request, reply) => {
        let accessToken;
  
        Oauth2.authorizationCode.getToken({
          code: request.query.code,
          redirect_uri: 'http://localhost:19682/api/slack-callback'
        })
        .then(res => {
          if (!res.ok) {
            throw res.error
          }
          
          accessToken = res.access_token
          return Axios.get(`http://slack.com/api/users.identity?token=${accessToken}`)
        })
        .then(res => res.data)
        .then(res => {
          const slackUserID = res.user.id
          const userName = res.user.name
          const profilePic = res.user.image_512
    
          createFirebaseAccount(accessToken, slackUserID, userName, profilePic).then((firebaseToken) => {
            reply(`
              <script src="https://www.gstatic.com/firebasejs/4.6.2/firebase.js"></script>      
              <script>
                var token = '${firebaseToken}';
                var config = {
                  apiKey: 'AIzaSyBhVR8PAqBhUFalC6vMdRnhMuNlsJJS1nE'
                };
    
                var app = firebase.initializeApp(config);
                app.auth().signInWithCustomToken(token).then(function() {
                  window.close()
                });
              </script>
            `)
          })
        })
        .catch(err => {
          reply(Boom.badRequest(err))
        })
      }
    })
  
    // Static file serving fot Letsencrypt certificate
    server.route({
      method: 'GET',
      path: '/.well-known/acme-challenge/{file*}',
      handler: {
        directory: { 
          path: './.well-known/acme-challenge'
        }
      }
    })
  
    // Static file serving for the web app
    server.route({
      method: 'GET',
      path: '/{p*}',
      handler: {
        directory: {
          path: Path.join(__dirname, 'public')
        }
      }
    })
  
    await server.start()
  
    console.log(`Server running at ${server.info.uri}`)
  }
  
  try {
    provision()
  }
  catch (error) {
    console.error(JSON.stringify(error, null, 4));
  }
}
