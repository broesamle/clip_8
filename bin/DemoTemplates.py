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

FooterIndexpage_str = """
<footer>
<p>
© 2016, 2017 Martin Brösamle.<br>
Demos and Graphics are licensed under a <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode"> creative commons (BY-NC-SA)</a> license.
</p>
</footer>
"""

ScriptInBody_str = """
<script>
window.onload = function () {
    Clip8controler.init(document.getElementById("clip8svgroot"), true, true, false);
}
</script>"""

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
