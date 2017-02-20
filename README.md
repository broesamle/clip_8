`Clip_8`
========

An iconic computing platform in a web browser.

![Loom Demo](VISUAL-ABSTRACT.jpg)

What you see is not an animation. Despite the fact that there are graphical objects moving on an electronic display, at its core this is not an animation project.
Information processing focuses exclusively on the visual elements.

WysiwyC: What you see is what you compute. 

Nothing is invisible. A rectangle is a rectangle and a line is a line. No double click would open a dialog box to edit _preferences_ or _settings_. No invisible formulae connect table cells behind visible data. No databases in the background which we would access via program code or web interface.

The programs are drawn in Illustrator.
The graphics tells the engine what to do.

Demo
-----

[Loom Demo](https://broesamle.github.io/clip_8/demos/loom3.html) (runs on Chrome and Safari).


Tests
-----

[Reference Test Sheets](https://broesamle.github.io/clip_8/tests/) give a first impression.

Clip_8 makes extensive use of _SVG_, _Javascript_, and the _DOM_. Not all browsers implement all required parts of the
[SVG DOM Interface](https://www.w3.org/TR/SVG11/struct.html#DOMInterfaces]), i.e. `SVGElement.getIntersectionList` provides crucial functionality.


Copyright
---------

Copyright 2016, 2017 Martin Brösamle.


License
-------

+ The source code of the `Clip_8` interpreter (especially `*.js` files), the related page generators (especially `*.py`), and other portions of the distribution not explicitly licensed otherwise, are licensed under the GNU GENERAL PUBLIC LICENSE -- see the `LICENSE-GPL` file in this directory for details.

+ Demos and graphics (especially `*.svg`, `*.pdf`, `*.jpg`, `*.png` files) are licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode) -- see `LICENSE-CC-BY-NC-SA` file in this directory for details.
