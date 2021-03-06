var cats;
var items_by_cat = {};

/** Meldet den Benutzer über Google Plus an für den Zugriff ans Backend 
 * 
 *  @param mode Sollte der access token automatisch aktualisiert werden ohne ein Popup
 *  @param authorizeCallback Url, worauf Google den User weiterleiten nach einem login
 */
function signin(mode, authorizeCallback) {
  gapi.auth.authorize({
      client_id: '760560844994-04u6qkvpf481an26cnhkaauaf2dvjfk0.apps.googleusercontent.com',
      scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'],
      immediate: mode
    },
    authorizeCallback);

    var html = '';

    html += "<h1>Bitte logge dich ein";
    $('#welcome').html(html);
}

/**
 * Überprüfe den Loginstatus des Clients
 */
function userAuthed() {
  NProgress.set(0.5);
  var request =
  gapi.client.oauth2.userinfo.get().execute(function(resp) {
    if (!resp.code) {
      gapi.client.donate.user.create().execute(function(resp) {
        if (!resp.code) {
          console.log(resp)
          NProgress.set(1);
          if (resp.is_admin || resp.is_volunteer) {
            signedIn();
          } else {
            showUserNotVolunteerOrAdmin();
          }
        }  else {
          deauth();
        }
      });
    } else {
      deauth();
    }
  });
}

/**
 * Initialisiere das Skript
 */
function init() {
  var apisToLoad = 2;
  NProgress.start();
  var loadCallback = function (a) {
    console.log(a)
    if (--apisToLoad == 0) {
      signin(true, userAuthed);
    }
  };
  $('#signInButton').text('Signing in ...');
  apisToLoad = 2;
  apiRoot = 'https://donate-backend.appspot.com/_ah/api';
  gapi.client.load('donate', 'v1', loadCallback, apiRoot);
  gapi.client.load('oauth2', 'v2', loadCallback);
}

function auth() {
  //signin(false, userAuthed);
  // TMP Fix, init() doesn't get called by client.js
  init()
}

/**
 * Signalisiere, dass der Benutzer nicht angemeldet ist
 */
function deauth() {
  gapi.auth.setToken(null);
  $('#signInButton').show();
  $('#signInButton').text('Sign in');
  $('#signOutButton').hide();
}

/**
 * Signalisiere, dass der Benutzer angemeldet ist
 */
function signedIn() {
  $('#signInButton').hide();
  $('#signOutButton').show();
    gapi.client.oauth2.userinfo.get().execute(function(resp) {
        var html = '';
        var firstname = resp.given_name;
        var lastname = resp.family_name;
        
        html += "<h1 style='display:inline;margin:0px;' class='black-text' data-i18n='volunteer:welcome'>Welcome</h1><h1 class='black-text' style='display:inline;margin:0px;'>, " + firstname + ".</h1>";
        $('#welcome').html(html);
    });
}

//sprachenauswahl und FAQ-Initialisierung
$(document).ready(function () {
  setQuestionListener('#answered');
  setQuestionListener('#unanswered');

  var option = {
    fallbackLng: 'en',
    ns: {
      namespaces: ['volunteer']
    },
    detectLngQS: 'lang'
  };

  $.i18n.init(option)
      .done(function () {
        $('[data-i18n]').i18n();
      })
      .fail(function () {
        $('[data-i18n]').i18n();
      });


  $('#lang-select li[lang]').on('click', function() {
    var lang = $(this).attr('lang');

    if(lang == "de"){
      $("#flag_de").show();
      $("#flag_en").hide();
    }

    if(lang == "en"){
      $("#flag_de").hide();
      $("#flag_en").show();
    }


    $('#lang-select li[lang]').removeClass("active");
    $(this).addClass("active");
    $.i18n.setLng(lang, function(){
      $('[data-i18n]').i18n();
    });
  });
});

/**
 * Wandelt das erste Zeichen in ein Großbuchstaben um
 * 
 * @param {string} str das zu verwandelne Zeichen
 */
function ucfirst(str) {
  var firstLetter = str.substr(0, 1);
  return firstLetter.toUpperCase() + str.substr(1);
}

/**
 * Handle das Speichern von Fragen
 */
function setQuestionListener(tag_id) {
  $(tag_id).on('click', '#save', function (e) {
    $(tag_id).html('');
    //
    var form = $(e.target).parent();
    NProgress.start();
    var question = form.find('#question')[0].value;
    var answer = form.find('#answer')[0].value;
    var language = form.find('#language')[0].value;
    var id = form.find('#id')[0].value;
    var answered = form.find('#answered')[0].checked;
    var category = form.find('#category')[0].value;
    gapi.client.donate.faqitem.update({
      'id': id,
      'question': question,
      'answer': answer,
      'answered': answered,
      'language': language,
      'category': category
    }).execute(function (resp) {
      NProgress.set(0.5);
      if (!resp.code) {
        window['show' + ucfirst(tag_id.substring(1))]();
      } else {
        console.log(resp);
        $('#errorModalText').text('Error: ' + resp.message);
        $('#errorModalLabel').append('Error Code ' + resp.code);
        $('#errorModal').modal();
      }

    });
  });
  
  //Handle das Löschen
  $(tag_id).on('click', '#delete', function (e) {
    $(tag_id).html('');
    //
    var form = $(e.target).parent();
    NProgress.start();
    var id = form.find('#id')[0].value;
    gapi.client.donate.faqitem.delete({'id': id}).execute(function (resp) {
      NProgress.set(0.5);
      if (!resp.code) {
        window['show' + tag_id.substring(1)]();
        //showUnanswered();
      } else {
        console.log(resp);
        $('#errorModalText').text('Error: ' + resp.message);
        $('#errorModalLabel').append('Error Code ' + resp.code);
        $('#errorModal').modal();
      }

    });
  });
  
  //Kategorienauswahl
  $(tag_id).on('click', '.cat', function (e) {
    var p = $(e.target).parent().parent().parent();
    p.find('#category').prop('value', e.target.id);
    p.find('#dropdownMenuTitle').html(e.target.textContent  + ' <span class="caret"></span></li>');
  });
}

/**
 * Wechsel den Tab zum Startfenster
 */
function showHome() {
  $('#home').show();
  $('#answered').hide();
  $('#unanswered').hide();
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a#home_link').parent().addClass('active');
}

/**
 * Lade die Fragen
 * 
 * @param {boolean} answered sollen die beantworteten Fragen angezeigt werden
 */
function loadQuestions(answered) {
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a' + (answered ? '#answered' : '#unanswered') + '_link').parent().addClass('active');
  if (NProgress.status == null) {
    NProgress.start();
  }
  
  //abfrage zum Backend nach den Kategorien
  gapi.client.donate.faqcat.list().execute(function (items) {
    var predrophtml = '<div id="" class="dropdown float_left"><button class="btn btn-default dropdown-toggle dropbutton" type="button" id="dropdownMenuTitle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">';
    var postdrophtml = '</button><ul class="dropdown-menu" aria-labelledby="dropdownMenu1">';
    cats = items.items;
    cats_by_id = {};
    items.items.forEach(function parseItems(item) {
      //entnehme die Daten nach Kategorie
      cats_by_id[item.id] = item;
    });
    
    items.items.forEach(function parseItems(item) {
        //Liste die Kategorien
      postdrophtml += '<li class="cat" id="' + item.id + '">' + item.name;
    });
    
    postdrophtml += '</ul></div>';
    NProgress.set(0.75);
    //abfrage nach den Fragen
    gapi.client.donate.faqitem.list({"answered": answered}).execute(function (items) {
      var html = '';
      if (items.items != undefined) {
        items.items.forEach(function parseItems(item, index, all) {
          html += '<div class="col-md-12 float_right"><div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">Question</h3></div><div class="panel-body">';
          html += '<div class="form-group"><label for="question">Question</label>';
          html += '<input type="text" class="form-control" id="question" placeholder="Question" value="' + item.question + '"></div>';
          html += '<div class="form-group"><label for="answer">Answer</label>';
          html += '<input type="text" class="form-control" id="answer" placeholder="Answer" value="' + item.answer + '"></div>';
          html += '<div class="form-group"><label for="language">Language-Code</label>';
          html += '<input type="text" class="form-control" id="language" placeholder="Language-Code" value="' + item.language + '"></div>';
          html += '<div class="checkbox"><label><input id="answered" type="checkbox"';
          //Benutzerhinweis ob die Frage bereits beantwortet wurde
          if (item.answered)
            html += ' checked';
        
          html += '>Answered</label></div>';
          html += '<input type="hidden" id="category" value="' + item.category + '"><input type="hidden" id="id" value="' + item.id + '">';
          html += predrophtml;
          if (item.category == undefined) {
              //kategorienauswahl für nicht eingeteilte Fragen
            html += 'Choose Category';
          } else {
            html += cats_by_id[item.category].name;
          }
          
          html += ' <span class="caret"></span>';
          html += postdrophtml;
          html += '<div class="float_right"><button class="btn btn-default formbutton pinkbutton" id="save">Save</button><button class="btn btn-default formbutton pinkbutton" id="delete">Delete</button></div></div></div></div></div>';
        });
      } else {
        html = 'Couldn\'t load FAQ Items';
      }

      //Füg es zum richtigen Bereich hinzu
      $(answered ? '#answered' : '#unanswered').html(html);
      NProgress.done();
    });
  });
}

/**
 * Zeige alle Unbeantworten Fragen
 */
function showUnanswered() {
  $('#home').hide();
  $('#answered').hide();
  $('#unanswered').show();
  loadQuestions(false);
}

/**
 * Zeige alle beantworteten Fragen
 */
function showAnswered() {
  $('#home').hide();
  $('#answered').show();
  $('#unanswered').hide();
  loadQuestions(true);
}

/**
 * Zeige fehlende Berichtungsdialog
 */
function showUserNotVolunteerOrAdmin() {
  $('#errorModalText').text('Only admins und volunteers are allowed to change things in this area.');
  $('#errorModalLabel').set('You are not allowed');
  $('#errorModal').modal();
}
