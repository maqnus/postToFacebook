import React, { Component } from 'react';

// https://developers.facebook.com/docs/pages/publishing

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user_id: '',
            user_access_token: '',
            pages: null,
            selected_page_id: '',
            page_access_token: '',
            message: 'hello fans'
        }
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
        });
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
        });
    }
    

    getPagesWhereUserIsAdmin(props) {
        const {
            user_id,
            user_access_token
        } = props;

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
        });
    }

    getPageAccessToken(props) {
        const {
            selected_page_id,
            user_access_token
        } = props;

        return new Promise((resolve, reject) => {
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
            <select id="pageIdSelect" onChange={ e => this.setState({"selected_page_id": e.target.selectedOptions[0].value}) }>
                { options }
            </select>
        )
    }

    render() {
        return(
            <div>
                <h1>Post to facebook</h1>
                <div className="fb-login-button" data-max-rows="1" data-size="large" data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="false"></div>
                
                <form onSubmit={(event) => event.preventDefault()}>
                    <ul>
                        <li>
                            <label htmlFor="userIdInput">User ID</label>
                            {
                                (this.state.user_id) && (
                                    <input type="text" id="userIdInput" value={this.state.user_id} onChange={(e) => this.setState({user_access_token: e.target.value})} />
                                )
                            }
                            <button onClick={() => this.getUserId().then(id => this.setState({"user_id": id}))}>getUserId</button>
                        </li>
                        <li>
                            <label htmlFor="userAccessTokenInput">User Access Token</label>
                            {
                                (this.state.user_access_token) && (
                                    <input type="text" id="userAccessTokenInput" value={this.state.user_access_token} onChange={(e) => this.setState({user_access_token: e.target.value})} />
                                )
                            }
                            <button onClick={() => this.getUserAccessToken().then(userToken => this.setState({"user_access_token": userToken}))}>getUserAccessToken</button>
                        </li>
                        <li>
                            <button onClick={() => this.getPagesWhereUserIsAdmin(this.state).then(pages => this.setState({"pages": pages}))}>getPagesWhereUserIsAdmin</button>
                        </li>
                        {
                            (this.state.pages) && (
                                <li>
                                    <label htmlFor="pageIdSelect">Pages where user is admin</label>
                                    {
                                        (this.state.selected_page_id) && (
                                            <input type="text" id="pageIdInput" value={this.state.selected_page_id} onChange={(e) => this.setState({"selected_page_id": e.target.value})} />
                                        )
                                    }
                                    { this.renderSelectGroupId() }
                                </li>
                            )
                        }
                        <li>
                            <label htmlFor="pageAccessTokenInput">Page Access Token</label>
                            {
                                (this.state.page_access_token) && (
                                    <input type="text" id="pageAccessTokenInput" value={this.state.page_access_token} onChange={(e) => this.setState({page_access_token: e.target.value})} />
                                )
                            }
                            <button onClick={() => this.getPageAccessToken(this.state).then(pageToken => this.setState({"page_access_token": pageToken}))}>getPageAccessToken</button>
                        </li>
                        <li>
                            <label htmlFor="messageInput">Message</label>
                            <textarea id="messageInput" defaultValue={this.state.message} onChange={(e) => this.setState({message: e.target.value})} />
                            <button onClick={() => this.postToPage(this.state)}>postToPage</button>
                        </li>
                    </ul>
                </form>
                <div>{JSON.stringify(this.state, null, 2)}</div>
            </div>
        )
    }
}