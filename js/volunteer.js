function init() {
    var apisToLoad;
    var loadCallback = function() {
        if (--apisToLoad == 0) {
            signin(true, userAuthed);
        }
    };
    $("#signInButton").text("Signing in ...");
    apisToLoad = 2;
    apiRoot = 'https://donate-backend.appspot.com/_ah/api';
    apiRoot = 'http://192.168.42.46:8080/_ah/api';
    gapi.client.load('donate', 'v1', loadCallback, apiRoot);
    gapi.client.load('oauth2', 'v2', loadCallback);
}

function signin(mode, authorizeCallback) {
    gapi.auth.authorize({client_id:"760560844994-04u6qkvpf481an26cnhkaauaf2dvjfk0.apps.googleusercontent.com",
        scope: "profile", immediate: mode},
        authorizeCallback);
}

function userAuthed() {
    var request =
    gapi.client.oauth2.userinfo.get().execute(function(resp) {
        if (!resp.code) {
            signedIn();
        }
    });
}

function auth() {
    signin(false, userAuthed);
};

function deauth() {
    gapi.auth.setToken(null)
    $("#signInButton").show();
    $("#signInButton").text("Sign in");
    $("#signOutButton").hide();
};

function signedIn() {
    $("#signInButton").hide();
    $("#signOutButton").show();
    jumpToPage();
}

$(document).ready(function() {
    $(window).bind( 'hashchange', function(e) {
        jumpToPage()
    });
});

function jumpToPage() {

    var location = window.location.hash;
    if (location.match("^#unanswered")) {
        $('nav').removeClass('fixed');
        $('nav li.active').removeClass('active');
        $('nav a#unanswered_link').parent().addClass('active');
        showUnanswered();
    }
    

}
/*function loadSharing() {
    $("#home").hide();
    $("#sharing").show();
    $("#faq").hide();
    $("#map_container").hide();
}*/
function showUnanswered() {
    $("#home").hide();
    $("#unanswered").show();
    gapi.client.donate.faqitem.list(answered=false).execute(function(items) {
        var html = "";
        items.items.forEach(function parseItems(item, index, all) {
            console.log(item);
            html += '<div class="jumbotron col-md-4"><form><div class="form-group"><label for="question">Question</label>';
            html += '<input type="text" class="form-control" id="question" placeholder="Question" value="'+item.question+'">';
            html += '</div><div class="form-group"><label for="answer">Answer</label>';
            html += '<input type="text" class="form-control" id="answer" placeholder="Answer" value="'+item.answer+'">';
            html += '</div><div class="checkbox"><label><input type="checkbox"';
            if(item.answered)
                html += " checked";
            html += '>Answered</label></div>';
            html += '<button class="btn btn-default" id="save'+index+'">Save</button></form></div>';
            id = "#save"+index

        });
        $("#unanswered").html(html);
        $("#unanswered").on('click','button',function(e) {
            //console.log(e);
            console.log($(e.target).parent());
            /*NProgress.start();
            gapi.client.donate.faqitem_update.list(question=$("#question"+index).value, answer=$("#answer"+index).value, answered=$("#answered"+index).value).execute(function(items) {
                console.log(items);
                NProgress.done();
            });*/
        });
    });  

}
jumpToPage();