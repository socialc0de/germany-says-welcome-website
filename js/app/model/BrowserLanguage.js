define(function (require) {
        var instance = null;

        var Hoverboard = require('hoverboard');
        var i18next = require('i18next');
        var $ = require('jquery');

        var languages = {
            'de': { label: 'Deutsch' },
            'en': { label: 'English' }
        };

        var i18nextOptions = {
            //detectLngQS: "lang",
            useCookie: true,
            fallbackLng: 'de'
        };

        function BrowserLanguage() {
            var instance = Hoverboard({

                init: function (state, namespace) {
                    var options = {ns: namespace};
                    $.extend(options, i18nextOptions)
                    $.i18n.init(options).always(function () {
                            instance.select($.i18n.lng());
                            $.each(languages, function (lang, data) {
                                instance.add(lang, data.flag, data.label);
                            });
                        }
                    );
                    return {namespace: namespace, languages: {}};
                },

                add: function (state, lang, flag, label) {
                    var langs = state.languages || {};
                    langs[lang] = {flag: flag, label: label};
                    return {languages: langs};
                },

                select: function (state, lang) {
                    $.i18n.setLng(lang, function (err, t) {
                        $("body").i18n();
                    });
                    return {selected: lang};
                }

            });
            return instance;
        }

        return BrowserLanguage;
    }
)
;
