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


import os, io, codecs, fnmatch
import TutorialTemplates as TEM
import Sections as SCT
import CFG

inDIRabs = os.path.join(CFG.rootDIRabs, CFG.tutorialDIR)
outDIRabs = inDIRabs

### klippen.html
backlinkHTML = TEM.Linkback.substitute(href="index.html", linktext="Tutorial")
nextlinkHTML = ""
footerHTML = TEM.FooterIndexpage_str
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

tocsectionsHTML = ""

alltutorials = SCT.tutorials
alltutorials.reverse()
while len(SCT.tutorials) > 0:
    title, infile = alltutorials.pop()
    print("Processing title:", title)
    inFN = os.path.join(inDIRabs, infile)
    if not os.path.isfile(inFN):
        print("WARNING: is not a file: ", inFN)

    solutionfile = os.path.splitext(infile)[0]+CFG.tutorial_solution_suffix+os.path.splitext(infile)[1]
    solutionFN = os.path.join(inDIRabs, solutionfile)
    if not os.path.isfile(solutionFN):
        solutiontitle = ""
    else:
        solutiontitle = "solution"

    tocsectionsHTML += TEM.TOCsection.substitute(
            tuttitle=title,
            tuthref=infile,
            solutiontitle=solutiontitle,
            solutionhref=solutionfile)

### index.html
### For the tutorials, index.html contains the TOC.
tocsectionsHTML = """
<h2>Getting Started</h2>
<p>
Every exercise is a clip_8 program in an SVG file.
</p>
<p>
You can <b>view an exercise</b> directly in your browser by left-clicking it.
The <b>zoom</b> function of your browser allows to adjust for an optimal view.
</p>
<p>
To <b>work on an exercise</b>, please save the SVG file on your local machine.<br>
Depending on your browser you can load the exercise SVG and then use <i>save page as</i>. Alternatively you may just right-click (PC) or command-key-click (MAC) one of the links and then choose <i>save/download link target</i> or the like.
</p>
<p>
Then, a vector graphics editor such as Inkscape or Illustrator can be used to <b>edit</b> exercises or other programs.
Save your changes as SVG file.
</p>
<p>
Using the <a href="klippen.html" target="_blank"><b>Klippen online interpreter</b></a> you can <b>load and execute</b> your solution or any other SVG file from your local machine.
</p>
<h2>Exercises</h2>
""" + tocsectionsHTML

backlinkHTML = TEM.Linkback.substitute(href="https://github.com/broesamle/clip_8", linktext="Project page on github")
nextlinkHTML = TEM.Linknext.substitute(href="klippen.html", linktext="Klippen online interpreter")
footerHTML = TEM.FooterIndexpage_str
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Tutorial", chaptercnt="",
                               MAIN=tocsectionsHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML,
                               SCRIPT="")
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Tutorial")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
