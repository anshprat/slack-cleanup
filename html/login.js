// Get the current URL
const url = new URL(window.location.href);

// Get the search parameters as a URLSearchParams object
const params = new URLSearchParams(url.search);

// Get the value of a specific query parameter
// const paramValue = params.get('paramName');

const oauth_code = params.get('code');
const oauth_state = params.get('state');
const link = document.getElementById('slackOauthReq');


if (oauth_state == null) {

    const state_id = Math.random().toString(36).substr(2, 9);

    // Set the ID as a session variable
    sessionStorage.setItem('state_id', state_id);

    origHref = link.getAttribute('href');

    newHref = origHref.replace("sci",sci) + '&state=' + state_id + '&redirect_uri=' + url;

    // Set the `href` attribute to a new value
    link.setAttribute('href', newHref);
    // window.location = newHref;
    function Redirect() 
    {  
        window.location=newHref; 
    } 
    // document.write("You will be redirected to a new page in 5 seconds"); 
    // setTimeout('Redirect()', 5000); 


} else {

    state_id = sessionStorage.getItem('state_id')

    if (oauth_state != '') {
        if (state_id != oauth_state) {
            alert('states not matching', state_id, oauth_state);
            window.location = url.origin + url.pathname;
        } else {
            // exchange token
            link.style.display = "none";

            const data = new FormData();
            data.append("code", oauth_code);
            data.append("client_id", sci);
            data.append("client_secret", scc);
            data.append("redirect_uri", url.origin + url.pathname);


            fetch('https://slack.com/api/oauth.v2.access', {
                method: "POST",
                body: data
            })
                .then(response => response.json())  // Parse the response as JSON
                .then(data => {
                    if (data.ok) {
                        var oauthdata = '';
                        authed_user = data["authed_user"];
                        for (var property in authed_user) {
                            sessionStorage.setItem(property, authed_user[property]);

                        }
                        window.location = url.origin + "/conversations.html"
                    } else {
                        window.location = url.origin + url.pathname;
                    }

                })
                .catch(error => {
                    // Handle any errors
                    console.error(error);
                    window.location = url.origin + url.pathname;

                });
        }
    }
}