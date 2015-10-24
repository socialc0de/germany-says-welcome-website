/* global $ */

export default {
  /**
   * Wechsel den Tab zur Startseite
   */
   show: function showHome () {
    $('#home').show()
    $('#sharing').hide()
    $('#sharing_details').hide()
    $('#faq').hide()
    $('#map_container').hide()
    $('nav').removeClass('fixed')
    $('nav li.active').removeClass('active')
    $('nav a#home_link').parent().addClass('active')
  }
}
