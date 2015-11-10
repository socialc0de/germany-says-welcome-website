Germany Says Welcome
====================

Homepage: [http://www.germany-says-welcome.de](http://www.germany-says-welcome.de)

<b>Germany Says Welcome</b> is an app and a website providing information for refugees arriving in Germany. This is
the source repository for the website.

Overview
--------

The website is based on an MVC design pattern. It uses an implementation of Facebook's Flux called 
[Hoverboard](https://github.com/jesseskinner/hoverboard) by Jesse Skinner. The general idea of Flux is that data
flows in just one direction. Data changes can only be triggered by calling <b>actions</b>. Actions <b>update</b> the model. 
View components <b>subscribe</b> to changes of the model but cannot write the model themselves. If they need to
change the model, they need to call <b>actions</b> and the data flow starts all over again. For more information on
Flux see [https://facebook.github.io/flux/](https://facebook.github.io/flux/).

Components are inspired by React but do not use React directly for simplicity reasons. React relies on IDE's with 
support for transpilers, bundles, source maps and much more adding to complexity. Debugging React applications
is still not trivial, dependency management goes through "browserify" or similar bundlers. To keep things simple and 
comprehensive we decided against the use of React and introduce a very tiny <b>React-like component model</b>.

Dependency management is done through <b>requirejs</b> which does not need any bundling/compiling, is pretty easy to debug 
and comes with a quite simple syntax. For more information on requirejs see [http://requirejs.org/](http://requirejs.org/).

Getting started
---------------

To setup your development environment clone this repository and start by setting up the node dependencies:

    # npm install
    
This should create a directory `node_modules` with all the node dependencies in place. After that you can install the
bower dependencies by calling:

    # bower install
    
Another directory called `bower_components` should be created containing all the third party modules used by the website.
The last step is to copy all the dependencies to their places in the website:

    # gulp deps
    
All third-party dependencies are kept in directories called `third-party` in resource directories like `js/third-party`
and `css/third-party`. Automatically generated code and content is not kept in the GIT repository and excluded through
`.gitignore`.

A good starting point for development is `index.html`. After it has setup all stylesheets and loaded all Javascript
dependencies it loads the main Javascript file `js/app/index.js`.

    [...]
    <script data-main="js/app/index.js" src="bower_components/requirejs/require.js"></script>
    </body>
    </html>

In the main Javascript file the environment for *requirejs* is setup and finally a data model for the language is created (line #1):
 
     #1 var browserLanguage = new BrowserLanguage();
     #2 var languageSelect = new LanguageSelect();
     #3 languageSelect.subscribe(browserLanguage);
     #4 browserLanguage.init('index');
     
At line #2 the LanguageSelect component is created which is the tiny language picker in the upper right corner of the website.
It lets the user choose in which language the texts on the page are shown. The language is German by default. If the
user chooses another language, the language is kept through the entire page and through all later visits by use of cookies.

Since `BrowserLanguage` is a <i>Flux</i> enabled data model (powered by <i>Hoverboard</i>), components 
like `LanguageSelect` can subscribe to changes and alter their appearance according to the state of the data model. In
line #3 the `LanguageSelect` component subscribes to `BrowserLanguages`.
  
Before line #4 the `BrowserLanguage` data model is still empty and the language picker does not have any languages to 
pick from. Line #4 initializes the `BrowserLanguage` data model by providing `index` as the translation context. Accoring 
to the context, the translation is loaded from `locales/<LANGUAGE>/index.json`.

Flux data model
----------------------------

To provide a data model with a Flux implementation from Hoverboard you need to create a module with this general structure:

    define(function(require) {
        
        function MyModel() {
            return Hoverboard(
                
                action1: function(state) {
                    newState = { ... };
                    return newState;
                },
                
                action2: function(state) {
                    ...
                });
        }
        
        return MyModel;
    });
    
You can later subscribe to the model by creating an instance of the module and subscribing to it following the advice from 
[Hoverboard documentation](https://github.com/jesseskinner/hoverboard#documentation):
 
    var myModel = new MyModel();
    
    myModel(function(state) {
        console.log( JSON.stringify(state) );
    });
    
    --- or ---
    myModel.getState(function(state) {
        console.log( JSON.stringify(state) );
    });
    
    --- or ---
    var myComponent = new MyComponent();
    myComponent.subscribe(myModel);
    
Components
----------
  
Components are inspired by React but hide the complexity of setting up a React development environment. Components are 
implemented by inheriting from the component base class `view/Component` and by overriding its `render()` method.

    define(function (require) {
    
        var Component = require("view/Component");
    
        Hello.prototype = new Component();
    
        Hello.prototype.render = function (state) {
            ...
        };
    
        function Hello() {
        }
    
        return Hello;
    
    });

The `render()` method takes a copy of the current state as an argument and should return the rendered HTML of the component.
In our framework you do not change DOM nodes of the HTML document directly. You always render the complete component and 
the system takes care of figuring out the differences between the current DOM nodes and the changes that need to apply. This
is the basic idea of React we try to resemble.

To attach the component somewhere in the DOM document you need to return a jQuery selector (line #4) with the HTML 
(line #3) in an array.

    #1 Hello.prototype.render = function (state) {
    #2    return [ 
    #3        '<h1>Hello world!</h1>, 
    #4        '#hello' 
    #5        ];
    #6 };

Let's say we have stored the user's name in the `state`, we can use it during rendering (line #3):
 
    #1 Hello.prototype.render = function (state) {
    #2    return [ 
    #3        '<h1>Hello, ' + state.name  + '!</h1>, 
    #4        '#hello' 
    #5        ];
    #6 };
 
In more complex scenarios, [Handlebars](http://handlebarsjs.com/) could be quite useful:

    var handlebars = require('handlebars');
    
    Hello.prototype.render = function (state) {
        var html = handlebars.compile('<h1>Hello, {{name}}!</h1>');
        return [ 
            html(state),
           '#hello' 
        ];
    };  
    
And to wire everything up you need a Flux data model for the user's name:

    define(function(require) {
            
            function User() {
                return Hoverboard(
                    
                    greet: function(state, name) {
                        return { name: name };
                    }
                    
            }
            
            return User;
        });

Finally you can use it all together:

    var user = new User();
    var hello = new Hello();
    hello.subscribe(user);
    user.greet("Jan");

Enjoy!
