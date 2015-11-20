$(document).ready(function () {
    $('.dropdown-toggle').dropdown();

    $('#lang-select').on('click', function (event) {
        var lang = $(event.target).attr('lang') || "de";
        $.i18n.setLng(lang, function (err, t) {
            $("body").i18n();
        });
    });

    $.i18n.init({
        detectLngQS: "lang",
        useCookie: true,
        fallbackLng: 'de',
        ns: 'index'
    }).always(function (x) {
        $("body").i18n();
    });

});
