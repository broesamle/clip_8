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

klippenHTML = TEM.KlippenInitialSVG.substitute(klippenmode="tutorial")

for key, bodyHTML in exercises.iterateSeries(
    template=TEM.Body_ExercisePage,
    prevlinktemplate=TEM.Linkback,
    nextlinktemplate=TEM.Linknext,
    prevlink_forfirst=TEM.Linkback.substitute(ELEMENT_KEY="index", chapter="Tutorial Start Page"),
    additionalfields={'KLIPPEN'    : TEM.KlippenControler_str+klippenHTML,
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

### index.html
### For the tutorials, index.html contains the TOC.
mainHTML = """
<p>
The tutorial assumes you have some experience with
<a href="https://en.wikipedia.org/wiki/Vector_graphics_editor  target="_blank">vector graphics editors</a>.
</p>
<p>
If you get stuck, please <b>read the <a href="survival.html">Survival Guide</a>!</b> as the tutorials and clip_8 are in an experimental state.
</p>
<p>
<p>
<b>Happy drawing!</b>
</p>

"""

backlinkHTML = TEM.LinkbackToProjectpage_str
nextlinkHTML = TEM.Linknext.substitute(ELEMENT_KEY="00_gettingStarted", chapter="Getting started")
footerHTML = TEM.FooterIndexpage_str
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Tutorial", chaptercnt="",
                               MAIN=mainHTML,
                               PREV_LINK=backlinkHTML, NEXT_LINK=nextlinkHTML,
                               FOOTER=footerHTML,
                               SCRIPT="")
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Tutorial")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()

exit(0)

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
