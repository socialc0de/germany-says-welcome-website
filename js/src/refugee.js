/* global $, gapi, NProgress */

import router from './refugee/router'
import langPicker from './refugee/language-picker'
import loginInit from './refugee/login-button'

import homeController from './refugee/home'
import faqController from './refugee/faq'
import mapController from './refugee/map'

import React from 'react'
import App from './refugee/components/app'

window.auth = function auth () {
  // signin(false, userAuthed);
  // TMP Fix, init() doesn't get called by client.js
  loginInit()
}

// Sprachenauswahl
/*
$(document).ready(function () {
  var option = {
    fallbackLng: 'en',
    ns: {
      namespaces: ['refugee']
    },
    detectLngQS: 'lang'
  }

  $.i18n.init(option)
      .done(function () {
        $('[data-i18n]').i18n()
      })
      .fail(function () {
        $('[data-i18n]').i18n()
      })

  langPicker()

  // Dialog-Handling für neue Fragen
  $('#newQuestionModal').on('click', '#save', function (e) {
    var form = $(e.target).parent().parent()
    NProgress.start()
    var question = form.find('#question_text')[0].value
    var answer = form.find('#answer_text')[0].value
    var language = form.find('#language_code')[0].value
    var category = form.find('#category')[0].value
    $('#newQuestionModal').modal('hide')

    var createItems = {'question': question, 'answer': answer, 'language': language, 'category': category}
    gapi.client.donate.faqitem.create(createItems).execute(function (resp) {
      NProgress.done()
      if (resp.code) {
        console.log(resp)
        $('#errorModalText').text('Error: ' + resp.message)
        $('#errorModalLabel').text('Error Code ' + resp.code)
        $('#errorModal').modal()
      }
    })
  })

  $('#newQuestionModal').on('click', '.cat', function (e) {
    var p = $(e.target).parent().parent().parent()
    console.log(p)
    console.log(p)
    p.find('#category').prop('value', e.target.id)
    p.find('#dropdownMenuTitle').text(e.target.textContent)
  })

  router($('#bs-example-navbar-collapse-1'), {
    showHome: homeController.show,
    showMap: mapController.show,
    showFAQ: faqController.show
  })
})
*/

$(document).ready(() => {
  // debugger
  React.render(
    // we can not use html5 history as of now because our root is a refugee.html
    React.createFactory(App)({ history: false }),
    document.getElementById('foobar')
  )
})

$('#map_container').hide()
