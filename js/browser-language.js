$(document).ready(function () {
   var browserlang = navigator.language;


   if(browserlang.match("de")){
      $.i18n.setLng('de', function(){
         console.log("Websitesprache: de");
         $("#de").addClass("active");
         $("#flag_de").show();
         $("#flag_en").hide();
         $('[data-i18n]').i18n();
      });
   }else{
      $.i18n.setLng('en', function(){
         console.log("Websitesprache: en");
         $("#en").addClass("active");
         $("#flag_de").hide();
         $("#flag_en").show();
         $('[data-i18n]').i18n();
      });
   }
});
