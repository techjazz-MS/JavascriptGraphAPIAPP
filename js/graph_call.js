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



