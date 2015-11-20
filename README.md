Germany Says Welcome
====================

Homepage: [http://www.germany-says-welcome.de](http://www.germany-says-welcome.de)

<b>Germany Says Welcome</b> is an app and a website providing information for refugees arriving in Germany. This is
the source repository for the website.

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

Gulp tasks
----------

Copy all dependencies to `third-party` directories. Non-minified versions are used for better debugging.

    gulp deps

    
Copy all assets and dependencies over to the `dist` directory for deployment and distribution of the website. Minified
versions of all dependencies are used.
 
    gulp build
     
Clean the `dist` directory. This is recommended before releasing the website.

    gulp cleanup
