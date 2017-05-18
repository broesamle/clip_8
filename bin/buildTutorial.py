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
import TutorialTemplates as TEM
from PyBroeModules.ItemsCollectionA import MDFilesCollection
import Sections as SCT
import CFG

inDIRabs = os.path.join(CFG.rootDIRabs, CFG.tutorialDIR)
outDIRabs = inDIRabs

exercises = MDFilesCollection(
                inputDIR=inDIRabs,
                pattern='*.'+CFG.exerciseinstruction_ext)

## collapse lists of strings into one string
exercises.tryReformatFields( ['chapter', 'check'],
                            (lambda field: functools.reduce((lambda s1, s2: s1+"\n"+s2), field)) )

## add additional fields to each exercise item
for mddatadict in exercises.values():
    if 'check' not in mddatadict or not mddatadict['check']:
        mddatadict['check'] = "undefined"
    scriptblock = TEM.Script.substitute(mddatadict)
    mddatadict['SCRIPT'] = scriptblock
    mddatadict['chaptercnt'] = "Tutorial"
    mddatadict['exerciseSVGfile'] = mddatadict['THIS_ELEMENT_KEY']+'.'+CFG.exerciseSVG_ext

for key, bodyHTML in exercises.iterateSeries(
    template=TEM.Body,
    prevlinktemplate=TEM.Linkback,
    nextlinktemplate=TEM.Linknext,
    prevlink_forfirst=TEM.LinkbackToProjectpage_str,
    additionalfields={'MAIN'       : TEM.KlippenControler_str+TEM.KlippenInitialSVG_str,
                      'FOOTER'     : TEM.Footer_str,
                      'pagetitle'  : "clip_8"}):
    print ("Processing:", key)
    headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Tutorial")
    documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)


    outFN = os.path.join(outDIRabs, key+'.'+CFG.exercisepage_ext)
    print ("  --output:", outFN)
    output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
    output_file.write(documentHTML)
    output_file.close()

exit(0)

### index.html
### For the tutorials, index.html contains the TOC.
mainHTML = """
<h2>Getting Started</h2>
<p>
The tutorials and clip_8 are in an experimental state. <b>Please read the <a href="survival.html">Survival Guide</a>!</b>
</p>
<p>
<a href="exercises.zip">Download the Exercises</a> and <b>unpack them</b>.
Have the unpacked files ready in a file manager/explorer/finder window.
</p>
<p>
Every exercise contains a (potentially incomplete) <b>clip_8 program</b> together with the <b>learners instructions</b> for the exercise.
</p>
<p>
Open the <a href="klippen.html" target="_blank">Klippen online interpreter</a> (in a separate window).
</p>
<p>
<b>Drop an SVG file</b> from the excercises in the marked drop area.
The control buttons let you <b>run `&#x25B6;`</b>, <b>pause `&#x2759;&#x2759;`</b>, <b>run one step `&#x276F;`</b>, <b>stop and reload `&#x25FC;`</b> the program.
</p>
<p>
When <b>making changes</b> in an SVG file (i.e. exercise) save your work as SVG file again. <b>Drop the changed file</b> again into Klippen for testing.
</p>
<p>
For a fluent work-flow it is best to keep the following windows open at all times:
</p>
<ul>
<li>Browser window with Klippen</li>
<li>File manager with exercise SVG files.</li>
<li>SVG Editor, with the current exercise open.</li>
</ul>
<p>
<b>Happy drawing!</b>
</p>

"""

backlinkHTML = TEM.Linkback.substitute(href="https://github.com/broesamle/clip_8", linktext="Project page on github")
nextlinkHTML = TEM.Linknext.substitute(href="survival.html", linktext="Survival Guide")
footerHTML = TEM.FooterIndexpage_str
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Tutorial", chaptercnt="",
                               MAIN=mainHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML,
                               SCRIPT="")
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Tutorial")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()

### klippen.html
backlinkHTML = TEM.Linkback.substitute(href="survival.html", linktext="Survival Guide")
nextlinkHTML = ""
footerHTML = TEM.Footer_str
bodyHTML = TEM.Body.substitute(pagetitle='<a href="index.html">clip_8</a>',
                               chapter="Klippen", chaptercnt="Online Interpreter",
                               MAIN=TEM.KlippenControler_str+TEM.KlippenInitialSVG_str,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML,
                               SCRIPT=TEM.ScriptInBody_str)
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Klippen")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "klippen.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
