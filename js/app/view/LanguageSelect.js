define(function (require) {

    var $ = require("jquery");

    var Component = require("view/Component");
    var handlebars = require("handlebars");

    LanguageSelect.prototype = Object.create(Component.prototype);

    LanguageSelect.prototype.render = function (state, props) {
        var selected = state.selected || "en";
        var languages = state.languages || {};
        var data = {
            languages: languages,
        };
        for ( var lang in data.languages ) {
            data.languages[lang].selected = lang == data.selected ? " selected" : "";
        }
        var template = '<li class="dropdown">' +
            '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' +
            '<img class="flag1" src="images/lang/german.png"> <img class="flag2" src="images/lang/english.png">' +
            '</a>' +
            '<ul class="dropdown-menu" id="language-switch">' +
            '{{#each languages}}' +
            '<li lang="{{@key}}" class="switchlink{{selected}}"><a lang="{{@key}}" class="black-text" href="#">{{this.label}}</a></li>' +
            '{{/each}}' +
            '</ul>' +
            '</li>';
        var html = handlebars.compile(template);
        var t = html(data);
        return html(data);
    };

    function LanguageSelect(selector) {
        Component.call(this, selector);
    }

    return LanguageSelect;

});
