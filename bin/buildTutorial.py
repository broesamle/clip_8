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

tocsectionsHTML = ""

allexercises = SCT.exercises
allexercises.reverse()
while len(allexercises) > 0:
    title, infile = allexercises.pop()
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
<h2 class="redtext">Survival Guide</h2>
<p>
`Clip_8` is under heavy development. <b>You will need patience! And it will be fun!</b>
Things are currently changing every coupple of days. 
Please check the <a href="https://github.com/broesamle/clip_8/labels/Tutorial%20%2B%20Getting%20Started">Tutorial and Getting Started Issues</a> 
for recent information for users.
</p>
<h3 id="edit-svg-files" class="redtext">Editing SVG files</h3>
<p>
The tutorial assumes you have some experience with 
<a target="_blank" href="https://en.wikipedia.org/wiki/Vector_graphics_editor">vector graphics editors</a> 
and have one ready to export 
<a target="_blank" href="https://en.wikipedia.org/wiki/Vector_graphics_editor">Scalable Vector Graphics (SVG)</a>. 
If you are unsure, try <a target="_blank" href="https://inkscape.org">Inkscape</a> (its free) or try using an online SVG editor.
</p>
<p>
<b>Do not mix SVG editors.</b> They each have their dialects. Files you have edited with Illustrator, say, may confuse Inkscape -- resulting in even stranger dialects. Clip_8 might run into trouble understanding such mixed files. 
</p>
<p>
<b>Use the snap function!</b> Elements need to be positioned precisely, otherwise clip_8 will not find them. 
Snap, this is a function of decent SVG editors, makes endpoints and centre points magnetic which makes editing much easier.
</p>
<h3 id="edit-svg-files" class="redtext">Get help / contributed by reporting errors</h3>
If you run into trouble running a program or if you encounter any unexpected behaviours please <a href="https://github.com/broesamle/clip_8/issues/new">file an issue</a>.
In this early phase, also small error reports can help a lot! Thank you in advance!
</p>
<p>
Ideally you
<ul>
<li>include the SVG file you used,</li>
<li>describe what happened,</li>
<li>cite any error messages,</li>
<li>tell us which SVG editor, browser, and operating system you were using.</li>
</ul>

<h2>Getting Started</h2>
<p>
<b><a href="exercises.zip">Download the Exercises</a> and unpack them.</b>
Every exercise is a clip_8 program in an SVG file. Have the unpacked files ready in a file manager/explorer/finder window.
</p>
<p>
<b>Edit the exercises</b> with the <a href="#edit-svg-files">vector graphics editor (see above)</a>.
</p>
<p>
<b>Save your changes as SVG file.</b>
</p>
<p>
Using the <a href="klippen.html" target="_blank">Klippen online interpreter</a> you can <b>load and execute</b> your solution.
</p>
<p>
To sum up, for a fluent work environment you keep the following windows open at all times:
</p>
<ul>
<li>Browser window with this tutorial.</li>
<li>Browser window with <a href="klippen.html" target="_blank">Klippen online interpreter</a></li>
<li>File manager with exercise SVG files.</li>
<li>SVG Editor, with the current exercise open.</li>
</ul>
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
