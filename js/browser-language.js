$(document).ready(function () {
   var browserlang = navigator.language;

   if(browserlang.match("de")){
      $.i18n.setLng('de', function(){
         console.log("Websitesprache: de");
         $('[data-i18n]').i18n();
      });
   }else{
      $.i18n.setLng('en', function(){
         console.log("Websitesprache: en");
         $('[data-i18n]').i18n();
      });
   }
});
