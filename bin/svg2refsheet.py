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

import RefsheetTemplates as TEM
from SVGHandling import *
import Sections as SCT
import CFG

inDIRabs = os.path.join(CFG.rootDIRabs, CFG.refsheetsvgDIR)
outDIRabs = os.path.join(CFG.rootDIRabs, CFG.testsDIR)
outprefix = ""
outsuffix = CFG.testfile_generatedFromSVG_suffix
outext = CFG.testfile_ext

class TestSection(SVGGroupCollection):
    def __init__(self, filename, *args, **kwargs):
        self.sectiondescription = "--SECTION-DESCRIPTION-TBA--"
        self.sectioninstructionicon = TEM.QuestionmarkIcon_svg
        SVGGroupCollection.__init__(
            self,
            filename,
            idprefixes=["TEST-", "SECTION"],
            defaults={
                'testdescription':"--TEST-DESCRIPTION-TBA--",
                'testid':"--TEST-ID-TBA--",
                'post':"--POST--",
                'testDOM':"--TEST--",
                'testtype':"--TYPE--",
                'cycles':"-1"},
            *args, **kwargs)

    def processElement(self, el):
        elid = el.get('id',"")
        if elid == "SECTIONINFO":
            ## process section wide information here
            for child in el:
                if stripNamespaceFromTag(child.tag) in ["text", "flowRoot"]:
                    # This is a bit of a hack: Illustrator does not give paragraphs indicators.
                    # Rather, it arranges text snippets at x,y coordinates. We try to infer paragraphs
                    # based on text snippets that start with a "+".

                    textfromsvg = "__|__" + "__|__".join([x for x in child.itertext()]) # text from all subnodes, separated by '__|__'
                    textfromsvg = textfromsvg.replace("__|__+", "__P__")
                    textfromsvg = textfromsvg.replace("__|__", " ")
                    paragraphs = textfromsvg.split("__P__")
                    paragraphs = [ " ".join(par.split()) for par in paragraphs ] # remove unnecessary whitespace
                    try: paragraphs.remove("")
                    except ValueError: pass
                    self.sectiondescription = paragraphs
                elif child.get('id',"").startswith("I"):
                    self.sectioninstructionicon = allChildrenToSVG(child)
                elif stripNamespaceFromTag(child.tag) == "rect":
                    pass # we don't care, illustrator puts them together with text
                else:
                    print("WARNING: UDO (unknown data object ;-) in SECTION description element:", child, child.get('id',"--unknown--"))
        else:
            try:
                key = self.keyFromId(elid)
            except ValueError:
                return    # ignore any elements where the id could not be translated into a key
            newitem = {}
            for child in el:
                if child.get('id',"").startswith("t0"):
                    newitem['pre'] = allChildrenToSVG(child)
                    newitem['testDOM'] = allChildrenToSVG(child)
                elif child.get('id',"").startswith("t1"):
                    newitem['post'] = allChildrenToSVG(child)
                elif child.get('id',"").startswith("I"):
                    newitem['pre'] += allChildrenToSVG(child)
                    newitem['post'] += allChildrenToSVG(child)
                    newitem['testDOM'] += allChildrenToSVG(child)
                elif stripNamespaceFromTag(child.tag) == "g":
                    print("WARNING: Encountered invalid sublayer or group %s in test %s." % (child.get('id',"--unknown--"), key))
                elif stripNamespaceFromTag(child.tag) in ["text", "flowRoot"]:
                    descriptionfromsvg = "".join([x+' ' for x in child.itertext()]) # text from all subnodes, separated by ' '
                    descriptionfromsvg = " ".join(descriptionfromsvg.split()) # remove unnecessary whitespace (kills newline etc)
                    index = descriptionfromsvg.find("META")
                    if index == "-1":
                        newitem['testdescription'] = descriptionfromsvg
                    else:
                        newitem['testdescription'] = descriptionfromsvg[:index]
                        meta = descriptionfromsvg[index:]
                        parsedmeta = CSS21Parser().parse_stylesheet(meta)
                        if len(parsedmeta.errors): print (parsedmeta.errors)
                        try:
                            for decl in parsedmeta.rules[0].declarations:
                                newitem[decl.name] = decl.value.as_css().replace(" ", "")  # Remove " ": use meta info in class lists

                        except IndexError:
                            print ("Empty META Block")

                elif stripNamespaceFromTag(child.tag) == "rect":
                    pass # we don't care, illustrator puts them together with text
                else:
                    print("WARNING: UDO (unknown data object ;-) in test element:", child, child.get('id',"--unknown--"), key)
            newitem['testid'] = key
            newitem['expectedto'] = {True:"fail", False:"pass"}[key in SCT.expected_to_fail]
            self.addItem(key, newitem)

appendixsectionsHTML = ""
passingtestsHTML = ""
failingtestsHTML = ""
tocsectionsHTML = ""
alltests = {}

chaptercnt = 0
lastchapter = None
backlinktitle, backhref = "Table of Contents", "toc.html"
SCT.sections.reverse()
firstoutfile = None
firstsection = None

while len(SCT.sections) > 0:
    chapter, section, infile = SCT.sections.pop()
    if len(SCT.sections) > 0:
        _, nextlinktitle, nexthref = SCT.sections[-1]
        nexthref = outprefix+os.path.splitext(nexthref)[0]+outsuffix+'.'+outext
    else:
        nexthref, nextlinktitle = "appendix.html", "Appendix"
    outfile = outprefix+os.path.splitext(infile)[0]+outsuffix+'.'+outext
    if not firstoutfile:
        firstoutfile = outfile
        firstsection = section
    inFN = os.path.join(inDIRabs, infile)
    outFN = os.path.join(outDIRabs, outfile)
    if os.path.isfile(inFN):
        print("Processing:", infile)
        if chapter == lastchapter:
            sectioncnt += 1
        else:
            chaptercnt += 1
            sectioncnt = 1
            lastchapter = chapter
        tests = TestSection(inFN, strictsubstitute=True)
        for thetest in tests.values():
            printid = thetest['testid'] + " "*max(0, 25-len(thetest['testid']))
            printdescr = thetest['testdescription'][:min(len(thetest['testdescription']), 55)]
            printdescr += " "* max(0, (55-len(printdescr)))
            print ( "  [ %10s ] %s (%s) (%s)" % (printid, printdescr, thetest['testtype'], thetest['expectedto']) )
        alltests[infile] = tests

        testsectionsHTML = tests.generateSeries(
            itemTEM=TEM.ReftestWithIntro,
            seriesTEM=TEM.Testsection,
            seriesData={
                'testsectiontitle':section,
                'chaptercnt':chaptercnt,
                'sectioncnt':sectioncnt,
                'sectiondescription': "\n<p>" + "</p>\n<p>".join(tests.sectiondescription) + "</p>",
                'sectioninstructionicon': tests.sectioninstructionicon}
            )

        backlinkHTML = TEM.Linkback.substitute(href=backhref, linktext=backlinktitle)
        nextlinkHTML = TEM.Linknext.substitute(href=nexthref, linktext=nextlinktitle)
        footerHTML = TEM.FooterRefsheet.substitute(refsheet_version=SCT.refsheet_version)
        bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>',
                                        chapter=chapter, chaptercnt="Chapter "+str(chaptercnt),
                                        TESTSECTIONS=testsectionsHTML,
                                        link1=backlinkHTML, link2=nextlinkHTML,
                                        FOOTER=footerHTML)

        headerHTML = TEM.Header.substitute(dependencies=TEM.DependJasmine_str+TEM.DependClip8_str, chapter=chapter)
        documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML, chapter=chapter)
        output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
        output_file.write(documentHTML)
        output_file.close()
        backhref, backlinktitle = outfile, section

        appendixsectionsHTML += alltests[infile].generateSeries(
            itemTEM=TEM.ReftestCore,
            seriesTEM=TEM.Testsection_inclHref,
            seriesData={'testsectiontitle':section, 'testsectionhref':outfile, 'chaptercnt':chaptercnt, 'sectioncnt':sectioncnt}
            )
        passingtestsHTML += alltests[infile].generateSeries(
            itemTEM=TEM.ReftestCore,
            seriesTEM=TEM.Testsection_inclHref,
            seriesData={'testsectiontitle':section, 'testsectionhref':outfile, 'chaptercnt':chaptercnt, 'sectioncnt':sectioncnt},
            filterFn=lambda _test:(_test['expectedto'] == "pass")
            )

        failingtestsHTML += alltests[infile].generateSeries(
            itemTEM=TEM.ReftestCore,
            seriesTEM=TEM.Testsection_inclHref,
            seriesData={'testsectiontitle':section, 'testsectionhref':outfile, 'chaptercnt':chaptercnt, 'sectioncnt':sectioncnt},
            filterFn=lambda _test:(_test['expectedto'] == "fail")
            )

        tocsectionsHTML += TEM.TOCsection.substitute(
            testsectiontitle=section,
            testsectionhref=outfile,
            chaptercnt=chaptercnt,
            sectioncnt=sectioncnt,
            sectioninstructionicon=tests.sectioninstructionicon)
    else:
        print ("Sections.py mentions a non existing file:", infile)

### Appendix
backlinkHTML = TEM.Linkback.substitute(href=outfile, linktext=section)
nextlinkHTML = TEM.Linknext.substitute(href="passing.html", linktext="Expected to pass")
footerHTML = TEM.FooterRefsheet.substitute(refsheet_version=SCT.refsheet_version)
bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>',
                               chapter="All Tests", chaptercnt="Appendix A",
                               TESTSECTIONS=appendixsectionsHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML)

headerHTML = TEM.Header.substitute(dependencies=TEM.DependJasmine_str+TEM.DependClip8_str, chapter="Appendix A")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "appendix.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()

### passing.html
backlinkHTML = TEM.Linkback.substitute(href="appendix.html", linktext="All Tests")
nextlinkHTML = TEM.Linknext.substitute(href="failing.html", linktext="Expected to fail")
footerHTML = TEM.FooterRefsheet.substitute(refsheet_version=SCT.refsheet_version)
passingtestsExplainHTML = """
<p>If you encounter a failing test in this section, please consider <a href="https://github.com/broesamle/clip_8/issues">filing an issue</a>. It may indicate several things:
<br>(a) By accident, the test is not in the list of tests that are expected to fail.
<br>(b) clip_8 has, in principle, the functionality to pass the test. However, the current implementation relies on
some experimental features not supported by all browsers. Please refer to
<a href="https://github.com/broesamle/clip_8/issues/9">Issue 9</a> in this respect.
<br>(c) Functionality is actually really broken and the test fails, for instance, because of recent disruptive changes.
</p>
<p>
Thank you for your contribution!
</p>
"""
bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>',
                               chapter="Expected to pass", chaptercnt="Appendix B",
                               TESTSECTIONS=passingtestsExplainHTML+passingtestsHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML)

headerHTML = TEM.Header.substitute(dependencies=TEM.DependJasmine_str+TEM.DependClip8_str, chapter="Appendix B")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "passing.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()

### failing.html
backlinkHTML = TEM.Linkback.substitute(href="passing.html", linktext="Expected to pass")
nextlinkHTML = ""
failingtestsExplainHTML = """
<p>
If you encounter a passing (all three subtests are green) test in this section, please consider <a href="https://github.com/broesamle/clip_8/issues">filing an issue</a>.
Most likely, it was forgotten to remove the test from the expected-to-fail list when a related feature was implemented.
</p>
<p>
Thank you for your contribution!
</p>
"""
bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>',
                               chapter="Expected to fail", chaptercnt="Appendix C",
                               TESTSECTIONS=failingtestsExplainHTML+failingtestsHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML)

headerHTML = TEM.Header.substitute(dependencies=TEM.DependJasmine_str+TEM.DependClip8_str, chapter="Appendix C")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "failing.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()

### toc.html

tocsectionsHTML += TEM.TOCsection.substitute(
    testsectiontitle="Appendix: All Tests",
    testsectionhref="appendix.html",
    chaptercnt="A",
    sectioncnt="",
    sectioninstructionicon="")
tocsectionsHTML += TEM.TOCsection.substitute(
    testsectiontitle="Appendix: Expected to pass",
    testsectionhref="passing.html",
    chaptercnt="B",
    sectioncnt="",
    sectioninstructionicon="")
tocsectionsHTML += TEM.TOCsection.substitute(
    testsectiontitle="Appendix: Expected to fail",
    testsectionhref="failing.html",
    chaptercnt="C",
    sectioncnt="",
    sectioninstructionicon="")
backlinkHTML = TEM.Linkback.substitute(href="index.html", linktext="Introduction")
nextlinkHTML = TEM.Linknext.substitute(href=firstoutfile, linktext=firstsection)
footerHTML = TEM.FooterRefsheet.substitute(refsheet_version=SCT.refsheet_version)
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Table of Contents", chaptercnt="",
                               TESTSECTIONS=tocsectionsHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML)
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter=chapter)
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "toc.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()

### index.html
# FIXME: Make a proper template rather than re-using the test section template.
contentHTML = """
<p>
<a href="toc.html"><b>Table of Contents&nbsp;&gt;&gt;&gt;&gt;&gt;</b></a>
</p>
<p>
<b>
Did you ever execute a drawing?</b><br>
The following pages serve as visual reference documents and as integration tests, simultaneously.
</p>
<p>
<b>How to read a reference sheet:</b><br>
<img src="example1.png">
</p>
<p>
The first box shows the precondition.<br>
The second box the desired result or postcondition.<br>
The third box after the colon is the test itself. Clip_8 engine will execute here.
</p>
<p>
The first test is a selftest: it checks whether precondition and test match before the execution.<br>
The second test fails on runtime errors or infinite execution.<br>
The third  test checks whether test and postcondition match after execution.
</p>
<p>
Not all browsers currently support all technological ingredients.
See <a href="https://github.com/broesamle/clip_8/">project documentation at github</a> for details.
</p>
"""
backlinkHTML = TEM.Linkback.substitute(href="https://github.com/broesamle/clip_8", linktext="Project page on github")
footerHTML = TEM.FooterIntro.substitute(refsheet_version=SCT.refsheet_version, refsheet_description=SCT.refsheet_description)
bodyHTML = TEM.Body.substitute(pagetitle="clip_8",
                               chapter="Introduction",
                               chaptercnt="",
                               TESTSECTIONS=contentHTML,
                               link1=backlinkHTML, link2="",
                               FOOTER=footerHTML)
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Introduction")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
