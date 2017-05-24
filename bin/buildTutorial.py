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
import TutorialTemplates as TEM
from PyBroeModules.ItemsCollectionA import MDFilesCollection
import Sections as SCT
import CFG

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
    headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Tutorial")
    documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)
    ## a bit hacky but it allows to use template fields in the instructions
    documentHTML = Template(documentHTML).substitute(exercises[key])
    ## write the file
    outFN = os.path.join(outDIRabs, key+'.'+CFG.exercisepage_ext)
    print ("  --output:", outFN)
    output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
    output_file.write(documentHTML)
    output_file.close()

### index.html
### For the tutorials, index.html contains the TOC.
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
<svg id="clip8svgroot" viewBox="0 0 512 512" style="width:512">
%s
</svg>
<button onclick="Clip8controler.pauseAction()" >&#x2759;&#x2759;</button>
<p>
Clip_8 is an arts project. At the same time it is a programming language.
Unlike most other programming languages, the program code is <i>graphical</i> rather than text-based. You will <i>draw</i> the programs.

Please find more on <a href="https://broesamle.github.io/clip_8/#philosophy--inspiration" target="_blank">Philosophy and Inspiration</a>
in the project's <a href="https://broesamle.github.io/clip_8/" target="_blank">README</a>.
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
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Tutorial")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()

### klippen.html

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
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Klippen")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "klippen.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
