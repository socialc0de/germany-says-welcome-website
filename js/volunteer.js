var cats;
var items_by_cat = {};

function signin(mode, authorizeCallback) {
  gapi.auth.authorize({
      client_id: '760560844994-04u6qkvpf481an26cnhkaauaf2dvjfk0.apps.googleusercontent.com',
      scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email'],
      immediate: mode
    },
    authorizeCallback);
}

function userAuthed() {
  var request =
    gapi.client.oauth2.userinfo.get().execute(function (resp) {
      if (!resp.code) {
        gapi.client.oauth2.user.create().execute(function (resp) {
          if (!resp.code) {
            signedIn();
          }
        });
      }
    });
}

function init() {
  var apisToLoad;
  NProgress.start();
  var loadCallback = function () {
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
  signin(false, userAuthed);
}

function deauth() {
  gapi.auth.setToken(null);
  $('#signInButton').show();
  $('#signInButton').text('Sign in');
  $('#signOutButton').hide();
}

function signedIn() {
  $('#signInButton').hide();
  $('#signOutButton').show();
}

$(document).ready(function () {
  setQuestionListener('#answered');
  setQuestionListener('#unanswered');

});

function ucfirst(str) {
  var firstLetter = str.substr(0, 1);
  return firstLetter.toUpperCase() + str.substr(1);
}

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
  $(tag_id).on('click', '.cat', function (e) {
    var p = $(e.target).parent().parent().parent();
    p.find('#category').prop('value', e.target.id);
    p.find('#dropdownMenuTitle').text(e.target.textContent);
  });
}
function showHome() {
  $('#home').show();
  $('#answered').hide();
  $('#unanswered').hide();
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a#home_link').parent().addClass('active');
}

function loadQuestions(answered) {
  $('nav').removeClass('fixed');
  $('nav li.active').removeClass('active');
  $('nav a' + (answered ? '#answered' : '#unanswered') + '_link').parent().addClass('active');
  if (NProgress.status == null) {
    NProgress.start();
  }
  gapi.client.donate.faqcat.list().execute(function (items) {
    var predrophtml = '<div id="dropdown" class="dropdown"><button class="btn btn-default dropdown-toggle dropbutton" type="button" id="dropdownMenuTitle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">';
    var postdrophtml = '</button><ul class="dropdown-menu" aria-labelledby="dropdownMenu1">';
    cats = items.items;
    cats_by_id = {};
    items.items.forEach(function parseItems(item) {
      cats_by_id[item.id] = item;
    });
    items.items.forEach(function parseItems(item) {
      postdrophtml += '<li class="cat" id="' + item.id + '">' + item.name + '</li>';
    });
    postdrophtml += '</ul></div>';
    NProgress.set(0.75)
    gapi.client.donate.faqitem.list({"answered": answered}).execute(function (items) {
      var html = '';
      if (items.items != undefined) {
        items.items.forEach(function parseItems(item, index, all) {
          html += '<div class="jumbotron col-md-4"><div><div class="form-group"><label for="question">Question</label>';
          html += '<input type="text" class="form-control" id="question" placeholder="Question" value="' + item.question + '"></div>';
          html += '<div class="form-group"><label for="answer">Answer</label>';
          html += '<input type="text" class="form-control" id="answer" placeholder="Answer" value="' + item.answer + '"></div>';
          html += '<div class="form-group"><label for="language">Language-Code</label>';
          html += '<input type="text" class="form-control" id="language" placeholder="Language-Code" value="' + item.language + '"></div>';
          html += '<div class="checkbox"><label><input id="answered" type="checkbox"';
          if (item.answered)
            html += ' checked';
          html += '>Answered</label></div>';
          html += '<input type="hidden" id="category" value="' + item.category + '"><input type="hidden" id="id" value="' + item.id + '">';
          html += predrophtml;
          if (item.category == undefined) {
            html += 'Choose Category<span class="caret"></span>';
          } else {
            html += cats_by_id[item.category].name;
          }
          html += postdrophtml;
          html += '<button class="btn btn-default formbutton" id="save">Save</button><button class="btn btn-default formbutton" id="delete">Delete</button></div></div>';
        });
      } else {
        html = 'Couldn\'t load FAQ Items';
      }

      $(answered ? '#answered' : '#unanswered').html(html);
      NProgress.done();
    });
  });
}
function showUnanswered() {
  $('#home').hide();
  $('#answered').hide();
  $('#unanswered').show();
  loadQuestions(false);
}

function showAnswered() {
  $('#home').hide();
  $('#answered').show();
  $('#unanswered').hide();
  loadQuestions(true);
}

function showUserNotVolunteerOrAdmin() {
  $('#errorModalText').text('Only admins und volunteers are allowed to change things in this area.');
  $('#errorModalLabel').set('You are not allowed');
  $('#errorModal').modal();
}
