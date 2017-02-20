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
from tinycss.css21 import CSS21Parser

import DemoTemplates as TEM
import RefsheetTemplates as REFTEM
from SVGHandling import *
import Sections as SCT
import CFG

class DemoPage(SVGGroupCollection):
    def __init__(self, filename, *args, **kwargs):
        SVGGroupCollection.__init__(
            self,
            filename,
            idprefixes=["clip8"],
            defaults={},
            *args, **kwargs)

    def processElement(self, el):
        print("processElement", el, el.tag)
        elid = el.get('id',"")
        try:
            key = self.keyFromId(elid)
        except ValueError:
            return    # ignore any elements where the id could not be translated into a key       newitem = {}
        newitem = {}
        newitem['svgdata'] = allChildrenToSVG(el)
        self.addItem(key, newitem)
        print("   ...ok")

inDIRabs = os.path.join(CFG.rootDIRabs, CFG.demosDIR)
outDIRabs = os.path.join(CFG.rootDIRabs, CFG.demosDIR)
outext = CFG.demofile_ext

tocsectionsHTML = ""
alldemos = {}
sectioncnt = 0
firstoutfile = None
firstsection = None
SCT.demos.reverse()
backlinktitle, backhref = "All Demos", "index.html"
while len(SCT.demos) > 0:
    chapter, infile = SCT.demos.pop()
    outfile = os.path.splitext(infile)[0]+'.'+outext
    if len(SCT.demos) > 0:
        _nextlinktitle, _nexthref = SCT.demos[-1]
        _nexthref = os.path.splitext(_nexthref)[0]+'.'+outext
        nextlinkHTML = REFTEM.Linknext.substitute(href=_nexthref, linktext=_nextlinktitle)
    else:
        nextlinkHTML = ""
    backlinkHTML = REFTEM.Linkback.substitute(href=backhref, linktext=backlinktitle)

    if not firstoutfile:
        # running in first round, only
        firstoutfile = outfile
        firstsection = chapter      ## Chapter and Section unified (for the demos)
    inFN = os.path.join(inDIRabs, infile)
    outFN = os.path.join(outDIRabs, outfile)

    if os.path.isfile(inFN):
        print("Processing:", inFN)
        sectioncnt += 1
        demopage = DemoPage(inFN, strictsubstitute=True)
        alldemos[infile] = demopage

        demopageHTML = demopage.generateSeries(itemTEM=TEM.Demo,
                                                seriesTEM=TEM.Demos,
                                                itemData={'viewBox': demopage.viewBox,
                                                'width':demopage.width,
                                                'height':demopage.height})
        footerHTML = TEM.Footer_str
        bodyHTML = TEM.Body.substitute(pagetitle='<a href="index.html">clip_8</a>',
                                        chapter=chapter, chaptercnt="Demos",
                                        DEMOS=demopageHTML,
                                        link1=backlinkHTML, link2=nextlinkHTML,
                                        FOOTER=footerHTML)
        headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter=chapter)
        documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)
        output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
        output_file.write(documentHTML)
        output_file.close()

        tocsectionsHTML += TEM.TOCsection.substitute(
            demotitle=chapter,
            demohref=outfile,
            sectioncnt=sectioncnt)

        backhref, backlinktitle = outfile, chapter
    else:
        print ("Sections.py mentions a non existing demo:", infile)

### index.html
### For the demos, index.html contains the TOC. There is no toc.html
backlinkHTML = REFTEM.Linkback.substitute(href="https://github.com/broesamle/clip_8", linktext="Project page")
nextlinkHTML = REFTEM.Linknext.substitute(href=firstoutfile, linktext=firstsection)
footerHTML = TEM.FooterIndexpage_str
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Demos", chaptercnt="Demos",
                               DEMOS=tocsectionsHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML)
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Demos")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
