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

Footer_str = """
<footer>
<p>
© 2016, 2017, 2020 Martin Brösamle.<br>
</p>
</footer>
"""

Body_withscript = Template("""
<body>
<nav>
$link1
<div class="chapternavtitle">$chaptercnt</div>
$link2
</nav>
<h1><span class="sndtitle">$pagetitle&nbsp;|</span>&nbsp;$chapter</h1>
$MAIN
$FOOTER
$SCRIPT
</body>
""")

Body = Template(Body_withscript.safe_substitute(SCRIPT=""))

Linkback = Template("""
<div class="leftlink">
<a href="$href">$linktext<br>
&lt;&lt;&lt;&lt;
</a>
</div>
""")

LinkbackToProjectpage_str = """
<div class="leftlink">
<a href="https://github.com/broesamle/clip_8">[project page on GitHub]</a>
</div>
"""

Linknext = Template("""
<div class="rightlink">
<a href="$href">$linktext<br>
&gt;&gt;&gt;&gt;</a>
</div>
""")
