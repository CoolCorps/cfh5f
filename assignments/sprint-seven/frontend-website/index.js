let googleUser = localStorage.getItem("googleUser")
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
        $("#profileName").html("Name: " + googleUserName)
        $("#profilePicture").attr("src", googleUserImageUrl.replace("s96-c", "s1024-c", true))
        //console.log(localStorage.getItem("id_token"))
    }
})

function join() {
    window.location.href = "/game"
}

function logout() {
    localStorage.clear()
    window.location.href = "/"
}