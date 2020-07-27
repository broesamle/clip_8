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

Demos = Template("$THEITEMS")

Demo = Template("""
<div id="c8_container">
<div id="c8ui_controls">
<a id="c8ui_reload_btn"
    style="visibility: hidden;"
    onclick="location.reload();">&larrhk;</a>
<a id="c8ui_play_btn">&#x25B6;</a>
<a id="c8ui_pause_btn"
    style= "visibility: hidden;">&#x2759;&#x2759;</a>
<a id="c8ui_step_btn">&#x276F;</a>
</div>
<svg id="clip8svgroot" viewbox="$viewBox" width="$width" height="$height">
$svgdata
</svg>
</div>
""")

TOCsection = Template("""
<h3>
$sectioncnt&nbsp;&nbsp;<a href="$demohref">$demotitle</a>
</h3>
""")
