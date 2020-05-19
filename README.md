
`clip_8`
========

**What you see is what you compute.**

`clip_8` is probably best described as a _visual virtual machine_ operating on inline SVG in the DOM.

+ Instructions and data are implemented as graphical SVG elements.

+ Graphics elements are visible to humans, just as any other SVG graphics in a web page.

+ `clip_8` interprets them as instructions of a purely visual programming language.

+ The programmer can observe the entire machine state during program execution.


How it works
------------

The programs can be drawn in vector graphics editors which support SVG output.

clip_8 interprets the SVG image:

1. Decode the arrangement of circles, lines, rectangles, paths, polygones as _instructions_, _control flow_, and _data_.

2. _Execute_ one instruction after the other.

    a) _Instructions_ manipulate the _data_ elements, i.e. _cut_, _align_, _resize_, or _move_ them.

    b) _Control flow_, defines the order of instructions, alternatives etc.


Why?
----

`clip_8` was designed as a [visual thought experiment](https://github.com/broesamle/clip8_materials/blob/master/visual-thought-experiments.md).

On [visuelle-maschine.de](https://visuelle-maschine.de/index-en.html)
you will find more technical projects with a strong commitment on visual experimentation.


Getting Started
---------------

[Demo session screenshots/slideshow](https://github.com/broesamle/clip8_materials/raw/master/demo-session-screenshots.pdf) (PDF) for a **very** first impression, START HERE!

[Demos](https://broesamle.github.io/clip_8/demos/), for a first impression.

[Tutorial](https://broesamle.github.io/clip_8/tutorial/), learn the language and the tricks.

For recent user information please check the [Tutorial and Getting Started Issues](https://github.com/broesamle/clip_8/labels/Tutorial%20%2B%20Getting%20Started).

[Klippen](https://broesamle.github.io/clip_8/tutorial/klippen.html), try `clip_8` online (no installation required).


Browser compatibility
---------------------

+ An experimental [Web Assembly](http://webassembly.org/) module uses [ncollide](http://ncollide.org/) to retrieve rectangles based on their location.

+ Tested in Chrome, Firefox

+ Credits go to Andrew Hobden, whose article [The Path to Rust on the Web](http://asquera.de/blog/2017-04-10/the-path-to-rust-on-the-web/) helped a lot in getting Rust and JavaScript to talk to each other.

To run on a local machine, please use a local http server, e.g.:

```
python -m http.server
```


Tests / Language documentation
------------------------------

The integration tests are provided in [Reference Test Sheets](https://broesamle.github.io/clip_8/tests/) which serve as _language reference_, simultaneously.


Building
--------

If you want to make changes to `clip_8` yourself you might need to do some or all of the following:

**Note:** These steps are not necessary for [using `clip_8` online via Klippen](https://broesamle.github.io/clip_8/tutorial/klippen.html).


### build the web assembly module

For the **wasm** modules use `make` in the `rs` directory.

### build html pages

If you wand to make changes to the demos, tutorials, or tests, the html pages will need a rebuild. Python scripts in `bin` support these steps:

Build Demos: `python svg2demo.py`

Build the Tutorials: `python buildTutorial.py`

Build the Reference Test Sheets: `python svg2refsheet.py`


Dependencies
------------

+ [Python-Markdown](http://pythonhosted.org/Markdown/):
`pip install Markdown` or `python -m pip install Markdown`

+ [tinycss](https://pypi.org/project/tinycss/)
`pip install tinycss` or `python -m pip install tinycss`

+ The utilities in [PyBroeModules](https://github.com/broesamle/PyBroeModules) are currently available as a github project, only. You can clone the project and copy/link the project directory in your local python `site-packages`.


Copyright
---------

Copyright 2016, 2017 Martin Brösamle.


License
-------

+ The source code of the `Clip_8` interpreter (primarily `*.js` files), the related page generators (primarily `*.py` files), and other portions of the distribution not explicitly licensed otherwise, are licensed under the GNU GENERAL PUBLIC LICENSE -- see the `LICENSE-GPL` file in this directory for details.

+ Except for the graphical language reference, demos and graphics (primarily `*.svg`, `*.pdf`, `*.jpg`, `*.png` files) not explicitly licensed otherwise are licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode) -- see `LICENSE-CC-BY-NC-SA` file in this directory for details.

+ The graphical language reference in the `refsheet-svg` and `tests` directories as well as the tutorial in the `tutorial` directory are explicitly *excluded* from the above creative commons license statement. You may use them as they are published by the author for
reference and testing purposes. Please contact the author if you wish to make changes or redistribute any of these files.

