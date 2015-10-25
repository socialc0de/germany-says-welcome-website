# Germany Says Welcome

The landing page is based on the Creative Theme by IronMediaSummit:

Copyright 2013-2015 Iron Summit Media Strategies, LLC. Code released under the [Apache 2.0](https://github.com/IronSummitMedia/startbootstrap-creative/blob/gh-pages/LICENSE) license.

Features:

* Map for free wifi hotspots and authorities
* Exchange-platform for jobs, items and more
* FAQ (frequently asked questions) for refugees
-> You can also request questions yourself
* Everyone can has his own profile
* Useful translations for important sentences
* View the website in your language
* People can volunteer as mentors to guide new refugees

Folder structure:
* images - Static images for the website
* css - Stylesheets for designing the webpage
* js - Javascript files for dynamic and clickable pages 
* third-party - Self hosted libaries 
* locale - internationalization (i18) for different languages

## Development notes

In order to bundle the JS files, you need [node](http://nodejs.org/). The version currently used is 4.2. In order to set everything up, after cloning the repo run `npm install`, which fetches all necessary dependencies. The build tool in use is [gulp](http://gulpjs.com/), so install it globally via `npm install --global gulp`.

Building works as follows:

```
$ # Bundle js files
$ gulp bundle
$ # Start a browser sync server, watch for changes and automatically recompile sources (useful for active development)
$ gulp
```

## Production build

The JavaScript file that results from the build is quite large and not suited for any serious usage. In order to produce a smaller version there is a separate gulp task:

```
$ # Bundle and minify javascript
$ gulp minify
```

You should run this before pushing the latest result to the server, so the file `js/dist/bundle.js` will always be optimized.
