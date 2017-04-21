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

DependJasmine_str = """
<link rel="shortcut icon" type="image/png" href="../lib/jasmine/lib/jasmine-2.5.2/jasmine_favicon.png">
<link rel="stylesheet" href="../lib/jasmine/lib/jasmine-2.5.2/jasmine.css">
<script src="../lib/jasmine/lib/jasmine-2.5.2/jasmine.js"></script>
<script src="../lib/jasmine/lib/jasmine-2.5.2/jasmine-html.js"></script>
<script src="../lib/jasmine/lib/jasmine-2.5.2/boot.js"></script>
"""

FooterRefsheet = Template("""
<footer>
<p><b>Version $refsheet_version</b></p>
<p>
Copyright 2016, 2017 Martin Brösamle.<br>
All rights reserved.<br>
</p>
</footer>
""")

FooterIntro = Template("""
<footer>
<p>
<b>Version $refsheet_version</b> $refsheet_description<br>
<p>
Copyright 2016, 2017 Martin Brösamle.<br>
All rights reserved.<br>
The graphical language reference is explicitly excluded from the creative commons license statement. Please see COPYRIGHT and README for details.
</p>
</footer>
""")

ScriptInBody_str = """<script src="../spec/spec_DOMrefsheet.js"></script>"""

Testsection = Template("""
<h3>$chaptercnt.$sectioncnt&nbsp;&nbsp;$testsectiontitle</h3>
<div class="sectionintro">
<svg class="sectioninstructionicon" viewbox="$viewBox">
$sectioninstructionicon
</svg>
$sectiondescription
</div>
$THEITEMS
""")

Testsection_inclHref = Template("""
<h3>$chaptercnt.$sectioncnt&nbsp;&nbsp;<a href="$testsectionhref">$testsectiontitle</a></h3>
$THEITEMS
""")

Testsection_H3heading = Template("""
<h3>$chaptercnt.$sectioncnt&nbsp;&nbsp;$testsectiontitle</h3>
""")

TOCchapter = Template("""
<h2>
$chaptercnt&nbsp;&nbsp;$chapter
</h3>
""")

TOCsection = Template("""
<h3>
<svg class="sectioninstructionicon" viewbox="$viewBox">
$sectioninstructionicon
</svg>
$chaptercnt.$sectioncnt&nbsp;&nbsp;<a href="$testsectionhref">$testsectiontitle</a>
</h3>
""")

## $THESERIES is used in MultiTemplate in the wrapper
reftestcorewrapper = Template("""
<!-- NOTE: The first three items in class list define the test. Handle with care! -->
<p class="DOMreftest $THESERIES" id="$testid">
<span class="pre-reference">
<svg viewbox="$viewBox" width="64" height="64" preserveAspectRatio="xMidYMid">
$pre
</svg>
</span>
&nbsp;==&gt;&nbsp;
<span class="post-reference">
<svg viewbox="$viewBox" width="64" height="64" preserveAspectRatio="xMidYMid">
$post
</svg>
</span>
&nbsp;:&nbsp;&nbsp;&nbsp;
<span class="testDOM">
<svg viewbox="$viewBox" width="64" height="64" preserveAspectRatio="xMidYMid">
$testDOM
</svg>
</span>
</p>""").safe_substitute()

ReftestCore = MT.TemplateChoice(wrapper=reftestcorewrapper)
ReftestCore.addTemplate("""$testtype $cycles""", lambda dict: dict['testtype'] == "normal_execution")
ReftestCore.addTemplate("""$testtype $p0 $color""", lambda dict: dict['testtype'] == "selectionset")
ReftestCore.addTemplate("""$testtype $cycles $idcolors""", lambda dict: dict['testtype'] == "exec_approx-dim")
ReftestCore.addTemplate("""$testtype $expectedresult""", lambda dict: dict['testtype'] == "element_ISCDdetection")

## $THESERIES is used in MultiTemplate in the wrapper
reftestcorewrapper_withIntro = Template("""
<p>$testdescription<br><span class="testmetainfo">[$THESERIES] expected to $expectedto.</span></p>
<!-- NOTE: The first three items in class list define the test. Handle with care! -->
<p class="DOMreftest $THESERIES" id="$testid">
<span class="pre-reference">
<svg viewbox="$viewBox" width="20%">
$pre
</svg>
</span>
&nbsp;==&gt;&nbsp;
<span class="post-reference">
<svg viewbox="$viewBox" width="20%">
$post
</svg>
</span>
&nbsp;:&nbsp;&nbsp;&nbsp;
<span class="testDOM">
<svg viewbox="$viewBox" width="20%">
$testDOM
</svg>
</span>
</p>""").safe_substitute()

ReftestWithIntro = MT.TemplateChoice(wrapper=reftestcorewrapper_withIntro)
ReftestWithIntro.addTemplate("""$testtype $cycles""", lambda dict: dict['testtype'] == "normal_execution")
ReftestWithIntro.addTemplate("""$testtype $p0 $color""", lambda dict: dict['testtype'] == "selectionset")
ReftestWithIntro.addTemplate("""$testtype $cycles $idcolors""", lambda dict: dict['testtype'] == "exec_approx-dim")
ReftestWithIntro.addTemplate("""$testtype $expectedresult""", lambda dict: dict['testtype'] == "element_ISCDdetection")

## A collection of graphical elements to be tested as one SVG element.
## An expected test result is used, rather than a reference in the DOM.
ExampleCollections = Template("$THEITEMS")
ExampleCollection = Template("""
<p>$testdescription<br><span class="testmetainfo">[$examplecollection_id] expected to be detected as $expectedresult.</span></p>
<p class="DOMreftest $testtype $expectedresult" id="$examplecollection_id">
<span>
</span>
<span>
</span>
<span class="testDOM">
<svg viewbox="$viewBox" width="$width">
$svgdata
</svg>
</span>
&nbsp;&nbsp;&nbsp;&nbsp;
</p>
""")

QuestionmarkIcon_svg = """
<path fill="#FF00A8" d="M33.057,35.523v4.277c0,1.006-0.201,1.73-0.604,2.163c-0.403,0.438-0.906,0.656-1.51,0.656c-0.638,0-1.157-0.218-1.56-0.656
	c-0.403-0.433-0.604-1.157-0.604-2.163v-7.095c7.348-2.718,12.363-5.436,15.047-8.153c1.51-1.51,2.266-3.405,2.266-5.687
	c0-3.757-1.368-6.97-4.102-9.638c-2.736-2.667-6.282-4.001-10.644-4.001c-2.215,0-4.304,0.252-6.267,0.755
	c-1.963,0.504-4.354,1.442-7.171,2.819v4.328c0,1.006-0.193,1.729-0.58,2.164c-0.385,0.437-0.897,0.654-1.534,0.654
	c-0.604,0-1.106-0.217-1.51-0.654c-0.403-0.436-0.604-1.158-0.604-2.164V6.033c5.234-2.315,8.622-3.674,10.166-4.077
	C26.464,1.319,29.081,1,31.698,1C37.3,1,41.806,2.678,45.21,6.033c3.405,3.355,5.108,7.599,5.108,12.732
	c0,3.154-1.016,5.947-3.045,8.38C45.243,29.578,40.504,32.37,33.057,35.523z M28.729,52.433h4.228c1.476,0,2.726,0.513,3.749,1.535
	c1.021,1.023,1.535,2.255,1.535,3.699c0,1.476-0.528,2.718-1.586,3.724c-1.056,1.006-2.289,1.511-3.698,1.511h-4.228
	c-1.442,0-2.676-0.514-3.698-1.536c-1.023-1.022-1.535-2.239-1.535-3.648c0-1.509,0.52-2.768,1.561-3.775
	C26.095,52.936,27.32,52.433,28.729,52.433z"/>
"""
