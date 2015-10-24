//Sprachenauswahl

export default function langPicker () {
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
  })
}
