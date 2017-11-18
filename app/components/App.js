import React, { Component } from 'react'

import firebase from '../firebase'

class App extends Component {
  
  constructor() {
    super();

    this.state = {
      loading: true,
      user: null
    }

    firebase.auth().onAuthStateChanged(user => {
      this.setState({
        loading: false,
        user
      })
    })
  }
  
  login() {
    window.open(
      'https://slack.com/oauth/authorize?scope=identity.basic,identity.avatar&client_id=14747090598.270361633905&redirect_uri=http%3A%2F%2Flocalhost%3A19682%2Fapi%2Fslack-callback',
      'Login with Slack',
      'height=315,width=400'
    )
  }

  logout() {
    firebase.auth().signOut()
  }

  render() {
    if (this.state.loading) {
      return (
        <p>Loading…</p>
      )
    }
    else {
      return (
        <div>
          {this.state.user ?
            <p className="centered">
              <img src={this.state.user.photoURL} />
              <button onClick={this.logout}>Logout</button>
            </p>
          :
            <button onClick={this.login}>Login</button>
          }
        </div>
      )
    }
  }
}

export default App
