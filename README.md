
`Clip_8`
========

`clip_8` is an arts project.  
It _creates_ the most poetic technical problems you have ever encountered : )

`clip_8` is a programming language.  
Instead of _typing_ source code you _draw_ it.

Programs are given as SVG images. `clip_8` reads the graphics elements and interprets them as instructions; which, in turn, operate on graphics elements. _What you see is what you compute!_

The present project implements an interpreter as a client-side web application. It operates on _inline SVG_ elements in the Document Object Model (DOM) of the web browser.


Getting Started
---------------

[Demos](https://broesamle.github.io/clip_8/demos/), for a first impression.

[Tutorial](https://broesamle.github.io/clip_8/tutorial/), draw and execute an SVG.

For recent user information please check the [Tutorial and Getting Started Issues](https://github.com/broesamle/clip_8/labels/Tutorial%20%2B%20Getting%20Started).

[Klippen](https://broesamle.github.io/clip_8/tutorial/klippen.html), the `clip_8` interpreter; online test environment.


Workflow
--------

FIXME: Screenshot of workflow.


Philosophy / Inspiration
------------------------

As an artist I wanted to create a programming language that can be understood in an intuitive way, just as cutting or folding paper.
As a low tech material, paper recalls the fact that information processing ultimately relies on cause and effect in physical matter:
Electrical chain reactions in silicon ... or cutting, moving, folding, and aligning pieces of cardboard.

In `clip_8` all operations and data are graphical elements. During execution the user can observe program execution: Instructions and data appear in the same view. This follows from the desire to continuously observe the complete machine state during program execution.


Language documentation / Integration tests
------------------------------------------

The integration tests are provided in [Reference Test Sheets](https://broesamle.github.io/clip_8/tests/) which serve as _language reference_, simultaneously.


Copyright
---------

Copyright 2016, 2017 Martin Brösamle.


License
-------

+ The source code of the `Clip_8` interpreter (primarily `*.js` files), the related page generators (primarily `*.py` files), and other portions of the distribution not explicitly licensed otherwise, are licensed under the GNU GENERAL PUBLIC LICENSE -- see the `LICENSE-GPL` file in this directory for details.

+ Except for the graphical language reference, demos and graphics (primarily `*.svg`, `*.pdf`, `*.jpg`, `*.png` files) not explicitly licensed otherwise are licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode) -- see `LICENSE-CC-BY-NC-SA` file in this directory for details.

+ The graphical language reference in the `refsheet-svg` and `tests` directories as well as the tutorial in the `tutorial` directory are explicitly *excluded* from the above creative commons license statement. You may use them as they are published by the author for
reference and testing purposes. Please contact the author if you wish to make changes or redistribute any of these files.

