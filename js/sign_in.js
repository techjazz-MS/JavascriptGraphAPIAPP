var applicationConfig = {
    // These default values get updated by the HTML inputs
    clientID: '15f96222-49fb-4be3-a9fd-aed6a53a2da1',
    scopes: ['https://graph.microsoft.com/user.read','https://graph.microsoft.com/user.readbasic.all'],
    authority: "https://login.microsoftonline.com/common"
};

var graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/beta/me",
    graphProfilePicEndpoint: "https://graph.microsoft.com/beta/me/photos/48x48/$value",
    graphMailEndpoint: "https://graph.microsoft.com/beta/me/messages"
};


var id_token_global = null
var access_token_global = null

var userAgentApplication = new Msal.UserAgentApplication(applicationConfig.clientID, applicationConfig.authority, function (errorDes, token, error, tokenType, instance) {
    // this callback is called after loginRedirect OR acquireTokenRedirect. It's not used with loginPopup,  acquireTokenPopup.
    if (error) {
        console.log(error + ": " + errorDes);
    }
    else
        console.log("Token type = " + tokenType);

})


function update_app() {
    var clientid_string = document.getElementById("clientid_input").value
    applicationConfig.clientID = clientid_string.split(' ').join('')
    var scopes_string = document.getElementById("scopes_input").value
    applicationConfig.scopes = scopes_string.split(' ').join('').split(',')
    var authority_selected = document.getElementById("authority_select").value
    applicationConfig.authority = "https://login.microsoftonline.com/" + authority_selected
    
    userAgentApplication = new Msal.UserAgentApplication(applicationConfig.clientID, applicationConfig.authority, function (errorDes, token, error, tokenType, instance) {
        // this callback is called after loginRedirect OR acquireTokenRedirect. It's not used with loginPopup,  acquireTokenPopup.
        if (error) {
            console.log(error + ": " + errorDes);
        }
        else
            console.log("Token type = " + tokenType);
    
    })
    
    document.getElementById("sign_in_text").innerHTML = '<div class="card card-body bg-light">' + 
                                                        '<h4>' + "Configuration: \n" + '</h4>' + JSON.stringify(applicationConfig) + '</div>';
}

function sign_in() {
    update_app();
    
    userAgentApplication.loginPopup(applicationConfig.scopes).then(function (id_token) {
        var user = userAgentApplication.getUser();
        
        if (user) {
            console.log("signed in sucessfully");
            console.log(id_token);
            id_token_global = id_token;
            updatePage();
            // get an access token
            userAgentApplication.acquireTokenSilent(applicationConfig.scopes).then(function (access_token) {
                console.log("Success acquiring access token");
                console.log(access_token);
                access_token_global = access_token;
                updatePage();
                callMSGraph(graphConfig.graphMeEndpoint, access_token_global, graphAPICallback);
                getProfilePic(graphConfig.graphProfilePicEndpoint, access_token_global);
            }, function (error) {
                // interaction required
                if (error.indexOf("interaction_required" != -1)) {
                    userAgentApplication.acquireTokenPopup(applicationConfig.scopes).then(function (access_token) {
                        console.log("Success acquiring access token");
                        console.log(access_token);
                        access_token_global = access_token;
                        updatePage();
                        callMSGraph(graphConfig.graphMeEndpoint, access_token_global, graphAPICallback);
                        getProfilePic(graphConfig.graphProfilePicEndpoint, access_token_global);
                    }, function (error) {
                        console.log("Failure acquiring token: " + error);
                        document.getElementById("sign_in_text").innerText = error;
                    });
                }
            });
            
        } else {
            console.log("signed in failure");
        }
    }, function (error) {
        console.log("error: " + error);
        document.getElementById("sign_in_text").innerText = error;
        });
}



function signOut() {
    userAgentApplication.logout();
}

function clear(){
    document.getElementById("id_token_container").reset();
}

function callMSGraph(endpoint, token, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200)
            callback(JSON.parse(this.responseText));
    }
    xmlHttp.open("GET", endpoint, true); // true for asynchronous
    xmlHttp.setRequestHeader('Authorization', 'Bearer ' + token);
    xmlHttp.send();
}

function getProfilePic(endpoint, token) {
    var xmlHttp = new XMLHttpRequest();
    // xmlHttp.onreadystatechange = function () {
    //     if (this.readyState == 4 && this.status == 200)
    //         callback(this.responseType);
    // }
    xmlHttp.open("GET", endpoint, true); // true for asynchronous
    xmlHttp.setRequestHeader('Authorization', 'Bearer ' + token);
    xmlHttp.responseType = "blob";
    xmlHttp.onload = profileImage;
    xmlHttp.send();
}


function graphAPICallback(data) {
    console.log(data);
    var userProfile = {
        displayName: data.displayName,
        mail: data.mail,
        businessPhones: data.businessPhones,
        mobilePhone: data.mobilePhone,
        city: data.city,
        companyName: data.companyName,
        // location: data.usageLocation,
        userType: data.userType
    }
    
    document.getElementById("displayName").innerHTML = userProfile.displayName;
    document.getElementById("mail").innerHTML = userProfile.mail;
    document.getElementById("businessPhones").innerHTML = userProfile.businessPhones;
    document.getElementById("mobilePhone").innerHTML = userProfile.mobilePhone;
    document.getElementById("city").innerHTML = userProfile.city;
    document.getElementById("companyName").innerHTML = userProfile.companyName;
    // document.getElementById("usageLocation").innerHTML = userProfile.usageLocation;
    document.getElementById("userType").innerHTML = userProfile.userType;
}

function profileImage(e) {
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(this.response);
    console.log(imageUrl);
    document.querySelector("#image").src = imageUrl;
}


var sign_in_button = document.getElementById("sign_in_button")
sign_in_button.addEventListener("click", sign_in);

var update_app_button = document.getElementById("update_app_button")
update_app_button.addEventListener("click", update_app);



