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

DependClip8_str = """
<script src="../lib/kd-tree-javascript/kdTree-min.js"></script>
<script src="../lib/clip8dependencies.js"></script>

<link rel="stylesheet" href="../css/refsheet.css">
<link rel="stylesheet" href="../css/clip8.css">

<script src="../js/svgdom.js"></script>
<script src="../js/svginterval.js"></script>
<script src="../js/svgretrieve.js"></script>
<script src="../js/paperclip.js"></script>
<script src="../js/clip8decode.js"></script>
<script src="../js/clip8.js"></script>
"""

Linkback = Template("""
<div class="leftlink">
<a href="$href">$linktext<br>
&lt;&lt;&lt;&lt;
</a>
</div>
""")

Linknext = Template("""
<div class="rightlink">
<a href="$href">$linktext<br>
&gt;&gt;&gt;&gt;</a>
</div>
""")