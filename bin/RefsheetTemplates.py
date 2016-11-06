import PyBroeModules.MultiTemplateA as MT
from string import Template

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
<title>$refsheettitle</title>

<link rel="shortcut icon" type="image/png" href="../lib/jasmine-2.5/jasmine_favicon.png">
<link rel="stylesheet" href="../lib/jasmine-2.5/jasmine.css">
<link rel="stylesheet" href="../css/refsheet.css">
<link rel="stylesheet" href="../css/clip8.css">

<script src="../lib/jasmine-2.5/jasmine.js"></script>
<script src="../lib/jasmine-2.5/jasmine-html.js"></script>
<script src="../lib/jasmine-2.5/boot.js"></script>
<script src="../js/svgdom.js"></script>
<script src="../js/svgretrieve.js"></script>
<script src="../js/paperclip.js"></script>
<script src="../js/clip8decode.js"></script>
<script src="../js/clip8.js"></script>
</head>
""")

Body = Template("""
<body>
<h1>$refsheettitle</h1>
$TESTSECTIONS
<script src="../spec/spec_DOMrefsheet.js"></script>
</body>
""")

Testsection = Template("""
<h3>$testsectiontitle</h3>
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
