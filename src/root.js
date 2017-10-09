import React from 'react';

const AppRoot = ({ store }) => {
    return (
        <div>
          <h1>Post to facebook</h1>
          <label>
            Page id
            <input type="text" name="page_id" value="546349135390552" />
          </label><br />
          <label>
            Message
            <input type="text" name="message" value="hello fans" />
          </label><br />
          <button>post</button>
        </div>
    );
};

export default AppRoot;
