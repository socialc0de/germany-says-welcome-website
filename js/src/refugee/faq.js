/* global $, gapi */

/**
 * Wechsel den Tab zum FAQ-Bereich
 */
export function showFAQ () {
  $('#home').hide()
  $('#sharing').hide()
  $('#sharing_details').hide()
  $('#faq').show()
  $('#map_container').hide()
  $('nav').removeClass('fixed')
  $('nav li.active').removeClass('active')
  $('nav a#faq_link').parent().addClass('active')

  fetchData(renderList)
}

/**
 * Fetches categories and FAQ items
 *
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export function fetchData (callback) {
  gapi.client.donate.faqcat.list().execute(function (cats) {
    gapi.client.donate.faqitem.list({ 'answered': true }).execute(function (items) {
      callback(cats, items)
    })
  })
}

/**
 * Build up the HTML and update the DOM
 *
 * @param  {Array} cats
 * @param  {Array} items
 * @return
 */
export function renderList (cats, items) {
  var items_by_cat = {}
  var html = ''
  var popup_html = '<div id="dropdown" class="dropdown"><button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenuTitle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Choose Category</button><ul class="dropdown-menu" aria-labelledby="dropdownMenu1">'
  var askbutton = '<h3 class="black-text">Didn\'t find what you need? <a class="btn btn-primary" data-toggle="modal" data-target="#newQuestionModal">Ask a question!</a></h3>'

  if (items.items === undefined) {
    // keine Einträge gefunden
    html += askbutton
    $('#faq').html(html)
  } else {
    items.items.forEach(function parseItems (item) {
      console.log(item)
      if (item.category in items_by_cat) {
        items_by_cat[item.category].push(item)
      } else {
        items_by_cat[item.category] = [item]
      }
    })

    html += '<div class="panel panel-default index table_of_content">'
    html += '<div class="panel-body"><h4>Inhalt</h4>'

    cats.items.forEach(function generateHTML (cat) {
      items = items_by_cat[cat.id]
      if (items !== undefined) {
        // Kategorie gefunden
        html += '<a href="#faq_' + cat.name + '">' + cat.name + '</a><br />'
      }

      popup_html += '<li class="cat" id="' + cat.id + '">' + cat.name + '</li>'
    })

    html += '</div>'
    html += '</div>'

    cats.items.forEach(function generateHTML (cat, catindex) {
      items = items_by_cat[cat.id]
      if (items !== undefined) {
        html += '<h2 class="anchor" id="faq_' + cat.name + '">' + cat.name + '</h2>'
        html += '<div class="panel-group" id="faq_' + catindex + '" role="tablist" aria-multiselectable="true">'
        items.forEach(function addQuestionToHTML (item, index) {
          html += '<div class="panel panel-default"><div class="panel-heading" role="tab" id="cat' + catindex + 'heading' + index + '"><h4 class="panel-title"><a role="button" data-toggle="collapse" data-parent="cat' + catindex + '" href="#cat' + catindex + 'collapse' + index + '" aria-expanded="false" aria-controls="cat' + catindex + 'collapse' + index + '">'
          html += item.question
          html += '</a></h4></div><div id="cat' + catindex + 'collapse' + index + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="cat' + catindex + 'heading' + index + '"><div class="panel-body">'
          html += item.answer
          html += '</div></div></div>'
        })

        html += '</div>'
      }
    })

    html += askbutton
    $('#faq').html(html)
    $('#newQuestionModalText').append(popup_html)
  }
}

export default {
  show: showFAQ
}
