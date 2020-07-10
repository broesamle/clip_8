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


import os, io, codecs, fnmatch, functools
from string import Template
from docgen import Classic_Clip8Page
import TutorialTemplates as TEM
from PyBroeModules.ItemsCollectionA import MDFilesCollection
import Sections as SCT
import CFG

print("\nBuilding the clip_8 Tutorials")
print("===================================================")

inDIRabs = os.path.join(CFG.rootDIRabs, CFG.tutorialDIR)
outDIRabs = inDIRabs

exercises = MDFilesCollection(
                inputDIR=inDIRabs,
                pattern='*.'+CFG.exerciseinstruction_ext,
                defaults={'congratmsg': ["Congratulations!"]})

## collapse lists of strings into one string
exercises.tryReformatFields( ['chapter', 'check', 'congratmsg'],
                            (lambda field: functools.reduce((lambda s1, s2: s1+"\n"+s2), field)) )

## add additional fields to each exercise item
for mddatadict in exercises.values():
    if 'check' not in mddatadict or not mddatadict['check']:
        mddatadict['check'] = "undefined"
    scriptblock = TEM.Script.substitute(mddatadict)
    mddatadict['SCRIPT'] = scriptblock
    mddatadict['exerciseSVGfile'] = mddatadict['THIS_ELEMENT_KEY']+'.'+CFG.exerciseSVG_ext
    mddatadict['chaptercnt'] = "[" + mddatadict['exerciseSVGfile'] + "]"

klippenHTML = TEM.KlippenInitialSVG.substitute(klippenmode="tutorial")

for key, bodyHTML in exercises.iterateSeries(
    template=TEM.Body_ExercisePage,
    prevlinktemplate=TEM.Linkback,
    nextlinktemplate=TEM.Linknext,
    prevlink_forfirst=TEM.Linkback.substitute(ELEMENT_KEY="index", chapter="Tutorial Start Page"),
    additionalfields={'KLIPPEN'    : klippenHTML,
                      'FOOTER'     : TEM.Footer_str,
                      'pagetitle'  : "clip_8"}):
    print ("Processing:", key)
    clip8doc = Classic_Clip8Page(title="clip8 | Tutorial",
                             cssfiles=["../css/klippen.css"])
    outFN = os.path.join(outDIRabs, key+'.'+CFG.exercisepage_ext)
    print ("    output:", outFN)
    clip8doc.write_file(outFN, bodyHTML)


### index.html
### For the tutorials, index.html contains the TOC.
print ("Processing: index.html (includes TOC)")
inFN = os.path.join(CFG.rootDIRabs, CFG.logoDIR, CFG.logofile)
input_file = codecs.open(inFN, "r", encoding="utf-8")
logoSVG = input_file.read()
input_file.close()
mainHTML = """
<p class="tutorial">
</p>
<p>
Welcome to the <b>clip_8</b> tutorial.
</p>
<svg id="clip8svgroot" class="clip8logo" viewBox="0 0 512 512">
%s
</svg>
<button onclick="Clip8controler.pauseAction()" class="smallbutton">&#x25fc;</button>
<p>
clip_8 was designed as a visual thought experiment. <a href="http://visuelle-maschine.de/index-en.html" target="_blank">visuelle-maschine.de</a> gives some background on the <a href="http://visuelle-maschine.de/index-en.html" target="_blank">philosophy behind visual thought experiments</a>.
</p>
<p>
For clip_8 the role of SVG graphics is twofold: (1) Graphics elements are visible to humans as any other SVG graphics. (2) The clip_8 interpreter will read them as instructions. The programs can be drawn in vector graphics editors which support SVG output.
</p>
<p>
The tutorial assumes you have some experience with
<a href="https://en.wikipedia.org/wiki/Vector_graphics_editor" target="_blank">vector graphics editors</a>.
</p>
<p>
If you get stuck, please <b>read the <a href="../survival-guide.html" target="_blank">Survival Guide</a>!</b> as the tutorials and clip_8 are in an experimental state.
</p>
<p>
<a href="00_gettingStarted.html">Happy drawing!</a>
</p>
""" % logoSVG
backlinkHTML = TEM.LinkbackToProjectpage_str
nextlinkHTML = TEM.Linknext.substitute(ELEMENT_KEY="00_gettingStarted", chapter="Getting started")
footerHTML = TEM.FooterIndexpage_str
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Tutorial", chaptercnt="",
                               MAIN=mainHTML,
                               PREV_LINK=backlinkHTML, NEXT_LINK=nextlinkHTML,
                               FOOTER=footerHTML,
                               SCRIPT=TEM.ScriptAutostart_str)
clip8doc = Classic_Clip8Page(title="clip8 | Tutorial",
                         cssfiles=["../css/klippen.css"])
outFN = os.path.join(outDIRabs, "index.html")
print ("    output:", outFN)
clip8doc.write_file(outFN, bodyHTML)

### klippen.html
print ("Generating: klippen.html")
backlinkHTML = TEM.Linkback.substitute(ELEMENT_KEY="index", chapter="Tutorial Start Page")
nextlinkHTML = ""
klippenHTML = TEM.KlippenInitialSVG.substitute(klippenmode="pro")
footerHTML = TEM.Footer_str
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Klippen", chaptercnt="Online Interpreter",
                               MAIN=klippenHTML,
                               PREV_LINK=backlinkHTML,
                               NEXT_LINK=nextlinkHTML,
                               FOOTER=footerHTML,
                               SCRIPT=TEM.ScriptInBody_str)
clip8doc = Classic_Clip8Page(title="clip8 | " + "Klippen",
                         cssfiles=["../css/klippen.css"])
outFN = os.path.join(outDIRabs, "klippen.html")
print ("    output:", outFN)
clip8doc.write_file(outFN, bodyHTML)
