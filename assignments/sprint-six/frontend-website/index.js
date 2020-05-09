let googleUser = getCookie("googleUser")
if (googleUser) {
    console.log("googleUser found")
} else {
    console.log("googleUser not found")
    window.location.href = "/login"
}

$(() => {
    if (googleUser) {
        googleUser = JSON.parse(googleUser)
        console.log(googleUser)
        let googleUserImageUrl = googleUser.Pt.QK
        let googleUserName = googleUser.Pt.Ad
        $("#profileName").html(googleUserName)
        $("#profilePicture").attr("src", googleUserImageUrl)
    }
})

function join() {
    window.location.href = "/game"
}

function logout() {
    deleteAllCookies()
    window.location.href = "/"
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}