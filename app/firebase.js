import firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyBhVR8PAqBhUFalC6vMdRnhMuNlsJJS1nE',
  authDomain: 'nbgapp-29236.firebaseapp.com',
  databaseURL: 'https://nbgapp-29236.firebaseio.com',
  projectId: 'nbgapp-29236',
  storageBucket: 'nbgapp-29236.appspot.com',
  messagingSenderId: '942352157673'
}

firebase.initializeApp(config)

export default firebase
