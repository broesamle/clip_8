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

Footer = Template("""
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
Powered by Jasmine, SVG, Javascript, and the DOM.
</p>
</footer>
""")

Body = Template("""
<body>
<nav>
$link1
<div class="chapternavtitle">$chaptercnt</div>
$link2
</nav>
<h1><span class="sndtitle">$pagetitle&nbsp;|</span>&nbsp;$chapter</h1>
Demos:
$DEMOS
Footer:
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
<button onclick="startAction()">Play.</button>
</p>
""")
