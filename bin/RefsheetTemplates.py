import PyBroeModules.MultiTemplateA as MT
from string import Template

Document = Template("""
<!DOCTYPE html>
<html>
$HEADER
$BODY
</html>
""")

DependJasmine_str = """
<link rel="shortcut icon" type="image/png" href="../lib/jasmine-2.5/jasmine_favicon.png">
<link rel="stylesheet" href="../css/jasmine.css">
<script src="../js/jasmine/jasmine.js"></script>
<script src="../js/jasmine/jasmine-html.js"></script>
<script src="../js/jasmine/boot.js"></script>
"""

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
<title>$refsheettitle</title>
$dependencies
</head>
""")

Linkback = Template("""
<div class="leftlink">
<a href="$href">$linktext</a>
XXXXXX
</div>
""")

Linknext = Template("""
<div class="rightlink">
<a href="$href">$linktext</a>
XXXXXX
</div>
""")

Body = Template("""
<body>
$link1
$link2
<h1>$pagetitle&nbsp;<span class="sndtitle">|&nbsp;$pagesndtitle</h1>
$TESTSECTIONS
<script src="../spec/spec_DOMrefsheet.js"></script>
</body>
""")

Testsection = Template("""
<h3>$testsectioncounter&nbsp;&nbsp;$testsectiontitle</h3>
$THEITEMS
""")

Testsection_inclHref = Template("""
<h3>$testsectioncounter&nbsp;&nbsp;<a href="$testsectionhref">$testsectiontitle</a></h3>
$THEITEMS
""")

SingleReferenceTest = Template("""
<div>$testdescription</div>
<p class="DOMreftest envokeOperation" id="$testid">
<span class="pre-reference">
<svg viewbox="0 0 64 64" width="64" height="64">
$pre
</svg>
</span>
&nbsp;==&gt;&nbsp;
<span class="post-reference">
<svg viewbox="0 0 64 64" width="64" height="64">
$post
</svg>
</span>
&nbsp;:&nbsp;&nbsp;&nbsp;
<span class="testDOM">
<svg viewbox="0 0 64 64" width="64" height="64">
$testDOM
</svg>
</span>
</p>
""")

SingleReferenceTest_light = Template("""
<p class="DOMreftest envokeOperation" id="$testid">
<span class="pre-reference">
<svg viewbox="0 0 64 64" width="64" height="64">
$pre
</svg>
</span>
&nbsp;==&gt;&nbsp;
<span class="post-reference">
<svg viewbox="0 0 64 64" width="64" height="64">
$post
</svg>
</span>
&nbsp;:&nbsp;&nbsp;&nbsp;
<span class="testDOM">
<svg viewbox="0 0 64 64" width="64" height="64">
$testDOM
</svg>
</span>
</p>
""")
