require.config(
    {
        baseURL: "js",
        paths: {
            'bootstrap': "../third-party/bootstrap",
            'handlebars': "../third-party/handlebars",
            'hoverboard': "../third-party/hoverboard",
            'html2hscript': ['../third-party/html2hscript'],
            'i18next': "../third-party/i18next",
            'jquery': "../third-party/jquery",
            'underscore': "../third-party/underscore",
            'virtual-dom': ['../third-party/virtual-dom'],
            'domReady': ['../third-party/requirejs-domReady']
        },
        shim: {
            hoverboard: {exports: 'Hoverboard'}
        }
    }
);

require(['domReady!', 'jquery', 'bootstrap', 'model/BrowserLanguage', 'view/LanguageSelect'], function (domReady, $, bootstrap, BrowserLanguage, LanguageSelect) {
    var browserLanguage = new BrowserLanguage();
    var languageSelect = new LanguageSelect("#lang-select");
    languageSelect.onRenderReady = function(event, element) {
        if ( event === 'create' ) {
            $('#lang-select .dropdown-toggle').dropdown();
        }
    };
    languageSelect.subscribe(browserLanguage);
    browserLanguage.init('index');

    $('#lang-select').on('click', function(event) {
        var lang = $(event.target).attr('lang');
        if ( lang ) {
            browserLanguage.select(lang);
        }
        $('.dropdown-toggle').dropdown('toggle');
        return false;
    });



});
