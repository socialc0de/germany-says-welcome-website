/**
 * Initialisiere das Skript
 */
export default function init () {
  var apisToLoad
  var loadCallback = function () {
    if (--apisToLoad === 0) {
      // Aufruf, wenn alle APIs geladen wurde
      signin(true, userAuthed)
    }
  }

  apisToLoad = 2
  window.apiRoot = 'https://donate-backend.appspot.com/_ah/api'
  gapi.client.load('donate', 'v1', loadCallback, apiRoot)
  gapi.client.load('oauth2', 'v2', loadCallback)
}

/** Meldet den Benutzer über Google Plus an für den Zugriff ans Backend
 *
 *  @param mode Sollte der access token automatisch aktualisiert werden ohne ein Popup
 *  @param authorizeCallback Url, worauf Google den User weiterleiten nach einem login
 */
function signin(mode, authorizeCallback) {
  gapi.auth.authorize({
      client_id: "760560844994-04u6qkvpf481an26cnhkaauaf2dvjfk0.apps.googleusercontent.com",
      scope: ["https://www.googleapis.com/auth/plus.login", "https://www.googleapis.com/auth/userinfo.email"],
      immediate: mode
    },
    authorizeCallback)
}

/**
 * Signalisiere, dass der Benutzer angemeldet ist
 */
function signedIn() {
  $("#signInButton").hide()
  $("#signOutButton").show()
}

/**
 * Überprüfe den Loginstatus des Clients
 */
function userAuthed() {
    gapi.client.oauth2.userinfo.get().execute(function (resp) {
        if (resp.code) {
            deauth()
        } else {
            gapi.client.donate.user.create().execute(function (resp) {
                if (resp.code) {
                    deauth()
                } else {
                    signedIn()
                }
            })
        }
    })
}

/**
 * Signalisiere, dass der Benutzer nicht angemeldet ist
 */
function deauth() {
  gapi.auth.setToken(null)
  $("#signInButton").show()
  $("#signInButton").text("Sign in")
  $("#signOutButton").hide()
}
