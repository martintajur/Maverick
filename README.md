★ Maverick - a small Javascript-based MVC framework 
===================================================

Maverick lets you
-----------------

* separate application logic (controller) from views and data gathering (models)
* create views and instantiate them with different context
* route URIs to controllers using regular expressions
* use centralized event handling
* change URI on browser address bar without refreshing the page (fallback to hash updating)
* execute multiple model calls at a time and provide a single callback function
* organize file structure the way you want (so that later you can combine all views, models and controllers into a single .js file in production for better page speed)
* and much more.

Maverick is right for you if...
-------------------------------

* You want a framework with a small footprint.
* You need exceptional performance.
* You want a framework that requires nearly zero configuration.
* You want a framework that applies strict variable scoping and access policies.
* You want a framework that does not require you to adhere to restrictive coding rules.

5 globally scoped variables
--------------------------------------------------

* models
* views
* controllers
* routes
* uri

These variables are used to start and stop views and controllers, access the state of the application (mostly derived from the URI), and to create and remove routes.

Footnotes and licence
---------------------

Copyright (c) 2010 Martin Tajur, Round Ltd (martin@round.ee).

Maverick is licensed under the MIT licence:

* http://www.opensource.org/licenses/mit-license.php

NOTES:
The included demo application uses jQuery 1.4.4 library which is licenced under MIT licence.
Maverick uses some of jQuery's functionality but can easily be adopted for use with any other Javascript library.
