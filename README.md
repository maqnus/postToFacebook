# Post til facebook med Graph API
[Graph API Explorer - Facebook for Developers](https://developers.facebook.com/tools/explorer)
https://developers.facebook.com/tools/console/
chrome://serviceworker-internals/

## Prerequisite
Sett opp utviklingsmiljø som kan bygge til prod-kode
Jeg har juksa litt, og satt opp et prosjekt på forhånd, pusha det til github

* Webpack
* React
* Axios
* Graph API


## Lag branch (den har du gjort på forhånd)
### Node Package Manager
`npm init -y`
`npm install save babel-cli babel-core babel-loader babel-preset-env babel-preset-es2015 babel-preset-react babel-preset-stage-2 express pug pug-cli react react-dom webpack axios`


### Dev env.
1. `touch server.js .babelrc .gitignore webpack.config.js Procfile .htaccess`
2. `mkdir src && touch src/index.js src/app.js`
3. `mkdir views && touch views/index.pug`

*./server.js*
``` javascript
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static('public'));

app.set('views', __dirname + '/views'); 
app.set('view engine', 'pug');

app.get('/', function(request, response) {
  response.render('index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
```

*webpack.config.js*
``` javascript
const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: [
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader'
      }
    ]
  }
};
```

*.gitignore*
`node_modules`

*.babelrc*
``` javascript
{
  "presets": ["react", "es2015", "stage-2"]
}
```

*Procfile*
`web: node server.js`

*.htaccess*
```
DirectoryIndex /public/index.html
order deny,allow
```

add scripts to *package.json*
``` javascript
"scripts": {
    "serve": "./bin/serve",
    "dev": "./bin/dev",
    "prod": "./bin/prod"
  }
```

*views/index.pug*
``` javascript
html
  head
    title=title
  body
    div(id='app')
    script(src='./bundle.js')
```


*src/index.js*
``` javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
const domAccessor = document.getElementById('app');

const render = props => {
  const { domAccessor } = props;
  ReactDOM.render(
    <App />,
    domAccessor
  );
}

render({domAccessor});
```

*src/app.js*
``` javascript
import React, { Component } from 'react';

export default class App extends Component {
    render() {
        return(
            <div className="container">
                <h1>Post to facebook</h1>
            </div>
        )
    }
}
```


### Bin script

`mkdir bin && touch bin/dev bin/prod bin/serve && chmod +x bin/*`

*bin/dev*
`webpack --config webpack.config.js --watch`

*bin/prod*
``` bash
rm -fr ./public &&
mkdir public &&
cp ./src/manifest.json ./public/manifest.json &&
cp -R ./src/assets/ ./public/assets/ &&
pug -O "{doctype: 'html'}" views --out ./public/ &&
webpack --config webpack.config.js
```

*bin/serve*
`node server.js`


## Lag heroku-app
[Heroku Apps](https://dashboard.heroku.com/apps)

1. Create new app (Isbilen)
2. Deploy method -> Github -> velg branch


## Deploy til heroku


## Lag en facebook app
[Facebook for Developers](https://developers.facebook.com/)

1. Add New App (Isbilen)
2. Add Product (Facebook Login -> Web)
3. Site URL fra heroku (Siden jeg utvikler på http://localhost:500 må jeg sette inn denne pathen på SiteURL, og på App Domains, når dette pushes ut til heroku må det endres til URL fra heroku)
4. Set up facebook sdk in your project

Add to *views/index.pug*
```
script
      include fb_sdk.js
```

Create *views/fb_sdk.js*
`touch views/fb_sdk.js`

[Quickstart - Web SDKs - Documentation - Facebook for Developers](https://developers.facebook.com/docs/javascript/quickstart)

``` javascript
window.fbAsyncInit = function() {
    FB.init({
      appId            : 'your-app-id',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v2.11'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
```

### Settings
Advanced Require App Secret to yes
### App review
1. Make [Isbilen] public? 
	1. yes
2. Start submission
	1. manage_pages
	2. publish_actions
	3. publish_pages
3. Legg til app icon
4. Legg til Privacy policy: [Create your Privacy Policy - TermsFeed](https://termsfeed.com/wizard/privacy-policy)




