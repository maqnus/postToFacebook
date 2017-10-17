import React, { Component } from 'react';

// https://developers.facebook.com/docs/pages/publishing

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            devmode: false,
            user_logged_in: false,
            user_id: '',
            user_access_token: '',
            user_name: '',
            pages: null,
            selected_page_id: null,
            page_access_token: '',
            message: ''
        }
    }

    componentDidMount() {
        setTimeout(() => { 
            const authResponse = this.userAuth();
            if(authResponse) {
                console.log('user is logged in');
                this.setState({
                    user_id: authResponse.userID,
                    user_access_token: authResponse.accessToken,
                    user_logged_in: true
                });
            } else {
                console.log('user is not logged in');
            }
        }, 1000);
        
        
    }

    userAuth() {
        return FB.getLoginStatus(response => {
            console.log('waiting for user id...');
            if (response.status === 'connected') {
                console.log('got user id', response, response.authResponse.userID);
                return response.authResponse.userID;
            } else {
                console.log('failed to get user access token', response);
                return false;
            }
        })
    } 

    logIn() {
        new Promise((resolve, reject) => {
            FB.login(function(response) {
                if (response.authResponse) {
                 console.log('Welcome!  Fetching your information.... ');
                 FB.api('/me', function(response) {
                   console.log('Good to see you, ' + response.name + '.');
                   resolve(response);
                 });
                } else {
                 console.log('User cancelled login or did not fully authorize.');
                 reject(response);
                }
            });
        }).then(response => this.main(response));
    }

    logOut() {
        FB.logout(function(response) {
            console.log('Goodbye.');
        });
        this.setState({
            user_id: '',
            user_access_token: '',
            user_logged_in: false
        });
    }

    getUserId() {
        return new Promise((resolve, reject) => {
            return FB.getLoginStatus(response => {
                console.log('waiting for user id...');
                if (response.status === 'connected') {
                    var id = response.authResponse.userID;
                    console.log('got user id', response, response.authResponse.userID);
                    resolve(id)
                } else {
                    console.log('failed to get user access token', response);
                    reject(response)
                }
            })
        }).then(id => this.setState({user_id: id}))
    }

    getUserAccessToken() {
        return new Promise((resolve, reject) => {
            return FB.getLoginStatus(response => {
                console.log('waiting for user access token...');
                if (response.status === 'connected') {
                    var accessToken = response.authResponse.accessToken;
                    console.log('got user access token', accessToken);
                    resolve(accessToken)
                } else {
                    console.log('failed to get user access token', response);
                    reject(response)
                }
            })
        }).then(response => this.setState({user_access_token: response}));
    }

    getPagesWhereUserIsAdmin() {
        const {
            user_id,
            user_access_token
        } = this.state;

        return new Promise((resolve, reject) => {
            return FB.api('/me/accounts', {
                fields: 'manage_pages,name',
            }, (response) => {
                if (!response || response.error) {
                    console.log('failed to get pages where user is admin: ', response);
                    reject(response)
                } else {
                    console.log('got pages where user is admin: ', response);
                    resolve(response.data)
                }
            })
        }).then(pages => {
            this.setState({
                "pages": pages,
                "selected_page_id": pages[0].id
            });
            this.getPageAccessToken();
        });
    }

    getPageAccessToken() {
        const {
            selected_page_id,
            user_access_token
        } = this.state;

        new Promise((resolve, reject) => {
            return FB.api( `v2.4/${selected_page_id}`, 'GET', {
                    "fields":"access_token"
                }, (response) => {
                    console.log('waiting for page access token...');
                    if (!response || response.error) {
                        console.log('failed to get user access token: ', response);
                        reject(response)
                    } else {
                        console.log('got pages where user is admin: ' + response.access_token);
                        resolve(response.access_token)
                    }
                }
              );
        }).then(token => {
            this.setState({"page_access_token": token});
        });
    }

    postToPage(props) {
        const {
            selected_page_id,
            page_access_token,
            message
        } = props;
        
        return new Promise((resolve, reject) => {
            return FB.api( `v2.4/${selected_page_id}/feed`,'POST', {
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

    renderSelectGroupId() {
        const options = this.state.pages.map(opt => {
            return <option key={opt.id} value={opt.id}>{opt.name}</option>
        });
        return (
            <select id="pageIdSelect" onChange={ e => {
                this.setState({"selected_page_id": e.target.selectedOptions[0].value});
                this.getPageAccessToken();
                }}>
                { options }
            </select>
        )
    }

    main(loginResponse) {
        this.setState({
            user_id: loginResponse.id,
            user_name: loginResponse.name,
            user_logged_in: true
        });
        this.getUserId();
        this.getUserAccessToken();
        this.getPagesWhereUserIsAdmin();
        this.getPageAccessToken();
    }

    render() {
        return(
            <div className="container">
                <h1>Post to facebook</h1>
                {(this.state.user_logged_in) && (<p>Lets create a post {this.state.user_name}</p>)}
                
                <div className="btn-group">
                    <button onClick={() => this.setState({devmode: !this.state.devmode})} className="btn btn-secondary">Toggle devmode</button>
                    {(this.state.user_logged_in) && (
                        <button onClick={() => this.logOut()} type="button" className="btn btn-light">Logout of facebook</button>
                    )}
                    {(!this.state.user_logged_in) && (
                        <button onClick={() => this.logIn()} type="button" className="btn btn-primary">Login to facebook</button>
                    )}
                </div>

                {(this.state.user_logged_in) && (
                    <form onSubmit={(event) => event.preventDefault()} className="form-group">
                        <p>Start by selecting which page you want to post to</p>
                        <ul>
                            {(this.state.devmode) && (
                                <li>
                                    <label htmlFor="userIdInput">User ID</label>
                                    <input type="text" id="userIdInput" value={this.state.user_id} onChange={(e) => this.setState({user_access_token: e.target.value})} />
                                </li>
                            )}
                            {(this.state.devmode) && (
                                <li>
                                    <label htmlFor="userAccessTokenInput">User Access Token</label>
                                    <input type="text" id="userAccessTokenInput" value={this.state.user_access_token} onChange={(e) => this.setState({user_access_token: e.target.value})} />
                                </li>
                            )}
                            {(this.state.pages) && (
                                <li>
                                    <label htmlFor="pageIdSelect">Your pages:</label>
                                    {
                                        (this.state.selected_page_id && this.state.devmode) && (
                                            <input type="text" id="pageIdInput" value={this.state.selected_page_id} onChange={(e) => this.setState({"selected_page_id": e.target.value})} />
                                        )
                                    }
                                    { this.renderSelectGroupId() }
                                </li>
                            )}
                            {(this.state.devmode) && (
                                <li>
                                    <label htmlFor="pageAccessTokenInput">Page Access Token</label>
                                    <input type="text" id="pageAccessTokenInput" value={this.state.page_access_token} onChange={(e) => this.setState({page_access_token: e.target.value})} />
                                    <button onClick={() => this.getPageAccessToken()}>getPageAccessToken</button>
                                </li>
                            )}
                            <li>
                                {(this.state.devmode) && (
                                    <label htmlFor="messageInput">Message</label>
                                )}
                                <textarea id="messageInput" defaultValue={this.state.message} onChange={(e) => this.setState({message: e.target.value})} />
                            </li>
                        </ul>
                        <button onClick={() => this.postToPage(this.state)} type="button" className="btn btn-success">Post</button>
                    </form>
                )}
                
                {(this.state.devmode) && (<div><code>{JSON.stringify(this.state, null, 2)}</code></div>)}
            </div>
        )
    }
}