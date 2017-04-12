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

from CommonTemplates import *

Document = Template("""
<!DOCTYPE html>
<html>
$HEADER
$BODY
</html>
""")

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
© 2016, 2017 Martin Brösamle.<br>
Demos and Graphics are licensed under a <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode"> creative commons (BY-NC-SA)</a> license.
</p>
<p>
Powered by SVG, JS, and the DOM.
</p>
</footer>
"""

Demo_ScriptInBody_str = """
<script>
window.onload = function () {
    Clip8controler.init(document.getElementById("clip8svgroot"));
}
</script>"""

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
$SCRIPT
</body>
""")

Demos = Template("$THEITEMS")

Demo = Template("""
<p>
<button onclick="Clip8controler.playAction()"  >&#x25B6;           </button>
<button onclick="Clip8controler.pauseAction()" >&#x2759;&#x2759;   </button>
<button onclick="Clip8controler.stepAction()"  >&#x276F;           </button>
<button onclick="location.reload();"           >&#x25FC;           </button>
</p>
<p>
<svg id="clip8svgroot" viewbox="$viewBox" width="$width" height="$height">
$svgdata
</svg>
</p>
""")

TOCsection = Template("""
<h3>
$sectioncnt&nbsp;&nbsp;<a href="$demohref">$demotitle</a>
</h3>
""")
