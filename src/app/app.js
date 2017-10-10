import React, { Component } from 'react';

// https://developers.facebook.com/docs/pages/publishing

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            page_id: '125728864814505',
            message: 'hello fans',
            user_access_token: '',
            page_access_token: '',
        }
    }

    getUserAccessToken() {
        return new Promise((resolve, reject) => {
            return FB.getLoginStatus(response => {
                console.log('waiting for access token');
                if (response.status === 'connected') {
                    var accessToken = response.authResponse.accessToken;
                    console.log('got access token', accessToken);
                    resolve(accessToken)
                } else {
                    console.log('failed to get access token', response);
                    reject(response)
                }
            })
        });
    }

    getPageAccessToken(props) {
        const {
            page_id,
            user_access_token
        } = props;

        return new Promise((resolve, reject) => {
            return FB.api(
                `v2.4/${page_id}`,
                'GET',
                {
                    "fields":"access_token"
                }, (response) => {
                    if (!response || response.error) {
                        console.log('Error occured');
                        reject(response)
                    } else {
                        console.log('Post ID: ' + response.id);
                        resolve(response.access_token)
                    }
                }
              );
        });
    }

    postToPage(props) {
        const {
            page_id,
            page_access_token,
            message
        } = props;
        
        return new Promise((resolve, reject) => {
            return FB.api(
                `v2.4/${page_id}/feed`,
                'POST',
                {
                    message,
                    access_token: page_access_token,
                    scope: 'publish_actions'
                }, (response) => {
                    if (!response || response.error) {
                        console.log('Error occured');
                        reject(response)
                    } else {
                        console.log('Post ID: ' + response.id);
                        resolve(response)
                    }
                }
              );
        });
      }

    render() {
        console.log(this.state);
        return(
            <div>
            <h1>Post to facebook</h1>
            <div className="fb-login-button" data-max-rows="1" data-size="large" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="false"></div>
            
            <form onSubmit={(event) => event.preventDefault()}>
                <label>
                    Page id
                    <input type="text" name="page_id" value={this.state.page_id} onChange={(e) => this.setState({page_id: e.target.value})} />
                </label><br />
                <label>
                    Message
                    <input type="text" name="message" value={this.state.message} onChange={(e) => this.setState({message: e.target.value})} />
                </label><br />
                <label>
                    User Access Token
                    <input type="text" name="message" value={this.state.user_access_token} onChange={(e) => this.setState({user_access_token: e.target.value})} />
                </label><br />
                <label>
                    Page Access Token
                    <input type="text" name="message" value={this.state.page_access_token} onChange={(e) => this.setState({page_access_token: e.target.value})} />
                </label><br />
                <button onClick={() => this.getUserAccessToken().then(userToken => this.setState({"user_access_token": userToken}))}>getUserAccessToken</button>
                <button onClick={() => this.getPageAccessToken(this.state).then(pageToken => this.setState({"page_access_token": pageToken}))}>getPageAccessToken</button>
                <button onClick={() => this.postToPage(this.state)}>postToPage</button>
            </form>
          </div>
        )
    }
}