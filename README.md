
`Clip_8`
========



**Programming should be as easy as cutting and folding paper or modelling a piece of clay.**

`clip_8` is an arts project and programming language following that ideal.

+ No code to be written.

+ Instructions and data are expressed in terms of arranged geometric primitives.

+ What you see is what you compute.

+ The programmer can observe the entire <q>machine</q> state during program execution.

+ The interpreter is implemented JavaScript and operates on inline SVG in the DOM.


Overview
--------

Instead of typing code in an editor the  programmer _draws_ an SVG image.

The interpreter interprets the SVG image as follows:

1. Decode the arrangement of elements (circles, lines, etc.) as _instructions_, _control flow_, and _data_.

2. _Execute_ one instruction after the other.

    a) _Instructions_ manipulate the _data_ elements, i.e. _cut_, _align_, _resize_, or _move_ them.

    b) _Control flow_, defines order of instructions, alternatives etc.


Web Assembly
------------

+ An experimental [Web Assembly](http://webassembly.org/) module uses [ncollide](http://ncollide.org/) to retrieve rectangles based on their location.

+ Tested in Chrome, Firefox

+ Credits go to Andrew Hobden, whose article [The Path to Rust on the Web](http://asquera.de/blog/2017-04-10/the-path-to-rust-on-the-web/) helped a lot in getting Rust and JavaScript to talk to each other.


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


Building
--------

For generating **demos**, **tutorials** and **reference test pages** checkout python the scripts in `bin`.

For the **wasm** modules use `make` in the `rs` directory.


Copyright
---------

Copyright 2016, 2017 Martin Brösamle.


License
-------

+ The source code of the `Clip_8` interpreter (primarily `*.js` files), the related page generators (primarily `*.py` files), and other portions of the distribution not explicitly licensed otherwise, are licensed under the GNU GENERAL PUBLIC LICENSE -- see the `LICENSE-GPL` file in this directory for details.

+ Except for the graphical language reference, demos and graphics (primarily `*.svg`, `*.pdf`, `*.jpg`, `*.png` files) not explicitly licensed otherwise are licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode) -- see `LICENSE-CC-BY-NC-SA` file in this directory for details.

+ The graphical language reference in the `refsheet-svg` and `tests` directories as well as the tutorial in the `tutorial` directory are explicitly *excluded* from the above creative commons license statement. You may use them as they are published by the author for
reference and testing purposes. Please contact the author if you wish to make changes or redistribute any of these files.

