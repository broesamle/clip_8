#
#   clip_8 interpreter; iconic language for paper-inspired operations.
#   Copyright (C) 2016, 2017  Martin Brösamle
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.
#


import PyBroeModules.MultiTemplateA as MT
from string import Template

Document = Template("""
<!DOCTYPE html>
<html>
$HEADER
$BODY
</html>
""")

DependClip8_str = """
<link rel="stylesheet" href="../css/refsheet.css">
<link rel="stylesheet" href="../css/clip8.css">
<script src="../js/svgdom.js"></script>
<script src="../js/svgretrieve.js"></script>
<script src="../js/paperclip.js"></script>
<script src="../js/clip8decode.js"></script>
<script src="../js/clip8.js"></script>
"""

Header = Template("""
<head>
<meta charset="utf-8">
<title>clip8 | $chapter</title>
$dependencies
</head>
""")

Footer_str = """
<p>
Not all browsers currently support all technological ingredients.
See <a href="https://github.com/broesamle/clip_8/">project documentation at github</a> for details.
</p>
<footer>
<p>
© 2016, Martin Brösamle.<br>
All rights reserved.
</p>
<p>
Powered by SVG, Javascript, and the DOM.
</p>
</footer>
"""

FooterIndexpage_str = """
<footer>
<p>
© 2016, Martin Brösamle.<br>
All rights reserved.
</p>
<p>
Powered by SVG, Javascript, and the DOM.
</p>
</footer>
"""


Body = Template("""
<body>
<nav>
$link1
<div class="chapternavtitle">$chaptercnt</div>
$link2
</nav>
<h1><span class="sndtitle">$pagetitle&nbsp;|</span>&nbsp;$chapter</h1>
$DEMOS
$FOOTER
</body>
""")

Demos = Template("$THEITEMS")

Demo = Template("""
<p>
<svg id="clip8svgroot" viewbox="$viewBox" width="$width" height="$height">
$svgdata
</svg>
</p>
<p>
<button onclick="Clip8controler.playAction()">play...</button>
<button onclick="Clip8controler.pauseAction()" disabled>. pause .</button>
<button onclick="Clip8controler.stepAction()">. step</button>
<button onclick="Clip8controler.stopAction()">stop .</button>
</p>
""")

TOCsection = Template("""
<h3>
$sectioncnt&nbsp;&nbsp;<a href="$demohref">$demotitle</a>
</h3>
""")
