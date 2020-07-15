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
from docgen import Classic_Clip8Page
from SVGHandling import *
import Sections as SCT
import CFG

class RefsheetDocument(Classic_Clip8Page):

    _init_jasmine = """
<link rel="shortcut icon" type="image/png" href="../lib/jasmine/lib/jasmine-2.5.2/jasmine_favicon.png">
<link rel="stylesheet" href="../lib/jasmine/lib/jasmine-2.5.2/jasmine.css">
<script src="../lib/jasmine/lib/jasmine-2.5.2/jasmine.js"></script>
<script src="../lib/jasmine/lib/jasmine-2.5.2/jasmine-html.js"></script>
<script src="../lib/jasmine/lib/jasmine-2.5.2/boot.js"></script>
"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args,
                         head_opener=RefsheetDocument._init_jasmine,
                         **kwargs)
        self.clip8initinstruct = ""     # The test runner takes care of the init

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
                    # This is a bit of a hack:
                    # Illustrator does not give paragraphs indicators.
                    # Rather, it arranges text snippets at x,y coordinates.
                    # We infer paragraphs based on snippets starting with "+".
                    # collect snippets from subnodes; separate them by __|__
                    textfromsvg = ("__|__" +
                                   "__|__".join([x for x in child.itertext()]))
                    textfromsvg = textfromsvg.replace("__|__+", "__P__")
                    textfromsvg = textfromsvg.replace("__|__", " ")
                    paragraphs = textfromsvg.split("__P__")
                    # remove unnecessary whitespace
                    paragraphs = [ " ".join(par.split()) for par in paragraphs ]
                    try: paragraphs.remove("")
                    except ValueError: pass
                    self.sectiondescription = paragraphs
                elif child.get('id',"").startswith("I"):
                    self.sectioninstructionicon = allChildrenToSVG(child)
                elif stripNamespaceFromTag(child.tag) == "rect":
                    pass # we don't care, illustrator puts them together with text
                else:
                    print(("WARNING: UDO (unknown data object ;-)"
                           " in SECTION description element:"),
                           child, child.get('id',"--unknown--"))
        else:
            # ignore any elements where the id could not be translated into a key
            try:
                key = self.keyFromId(elid)
            except ValueError:
                return
            newitem = {}
            if self.viewBox:
                newitem['viewBox'] = self.viewBox
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
                elif child.get('id',"").startswith("EX"):
                    # Example element collection
                    newitem['pre'] = "<!-- no precondition for this test -->"
                    newitem['post'] = "<!-- no postcondition for this test -->"
                    newitem['testDOM'] = allChildrenToSVG(child)
                elif child.get('id',"").startswith("BBox"):
                    # BBox overrides viewBox
                    newitem['viewBox'] = (child.get('x',"")
                                          + " " + child.get('y',"")
                                          + " " + child.get('width',"")
                                          + " " + child.get('height',""))
                elif stripNamespaceFromTag(child.tag) == "g":
                    print("WARNING: Encountered invalid sublayer or group %s in test %s."
                          % (child.get('id',"--unknown--"), key))
                elif stripNamespaceFromTag(child.tag) in ["text", "flowRoot"]:
                    # text from all subnodes, separated by ' '
                    descriptionfromsvg = " ".join(
                        [ x for x in child.itertext() ])
                    # remove unnecessary whitespace (kills newline etc)
                    descriptionfromsvg = " ".join(descriptionfromsvg.split())
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
                                # Remove " ": use meta info in class lists
                                newitem[decl.name] = (decl.value.as_css()
                                                      .replace(" ", ""))
                        except IndexError:
                            print ("Empty META Block")

                elif stripNamespaceFromTag(child.tag) == "rect":
                    # we don't care for rect (illustrator creates them)
                    pass
                else:
                    print("WARNING: UDO (unknown data object ;-) in test element:",
                          child, child.get('id',"--unknown--"), key)
            newitem['testid'] = key
            # map True to "fail" and False to "pass"
            newitem['expectedto'] = { True: "fail",
                                      False: "pass" }[key in SCT.expected_to_fail]
            self.addItem(key, newitem)

class ExampleCollection(SVGGroupCollection):
    def __init__(self, filename, *args, **kwargs):
        self.debug = False
        if self.debug: print("ExampleCollection", filename, args, kwargs)
        SVGGroupCollection.__init__(self,
                                    filename,
                                    idprefixes=["clip8"],
                                    defaults={},
                                    *args, **kwargs)

    def processElement(self, el):
        elid = el.get('id',"")
        newitem = {}
        newitem['svgdata'] = allChildrenToSVG(el)
        if self.debug: print("NEWITEM:", newitem)
        self.addItem("theonlyitem", newitem)

if __name__ == "__main__":
    print("\nBuilding the clip_8 Reference Test Sheets")
    print("===================================================")
    inDIRabs = os.path.join(CFG.rootDIRabs, CFG.refsheetsvgDIR)
    outDIRabs = os.path.join(CFG.rootDIRabs, CFG.testsDIR)
    outprefix = ""
    outsuffix = CFG.testfile_generatedFromSVG_suffix
    outext = CFG.testfile_ext
    print("    in:", inDIRabs)
    print("   out:", outDIRabs)
    appendixsectionsHTML = ""
    passingtestsHTML = ""
    failingtestsHTML = ""
    tocsectionsHTML = ""
    alltests = {}
    chaptercnt = 0
    lastchapter = None
    backlinktitle, backhref = "Introduction", "introduction.html"
    SCT.sections.reverse()
    firstoutfile = None
    firstsection = None
    footerHTML = TEM.FooterRefsheet.substitute(
                    refsheet_version=SCT.refsheet_version)
    while len(SCT.sections) > 0:
        chapter, section, infile = SCT.sections.pop()
        if len(SCT.sections) > 0:
            _, nextlinktitle, nexthref = SCT.sections[-1]
            nexthref = (outprefix +
                        os.path.splitext(nexthref)[0] +
                        outsuffix + '.' + outext)
        else:
            nexthref, nextlinktitle = "appendix.html", "Appendix"
        outfile = (outprefix +
                os.path.splitext(infile)[0] +
                outsuffix + '.' + outext)
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
                tocsectionsHTML += TEM.TOCchapter.substitute(
                                    chapter=chapter, chaptercnt=chaptercnt)
            tests = TestSection(inFN, strictsubstitute=True)
            for thetest in tests.values():
                printid = (thetest['testid'] +
                        " "*max(0, 25-len(thetest['testid'])))
                printdescr = thetest['testdescription'][:min(
                                len(thetest['testdescription']), 55)]
                printdescr += " "* max(0, (55-len(printdescr)))
                print ("  [ %10s ] %s (%s) (%s)" % (printid,
                                                    printdescr,
                                                    thetest['testtype'],
                                                    thetest['expectedto']))
            alltests[infile] = tests
            sectdesc = ("\n<p>" +
                        "</p>\n<p>".join(tests.sectiondescription) +
                        "</p>")
            testsectionsHTML = tests.generateSeries(
                itemTEM=TEM.ReftestWithIntro,
                seriesTEM=TEM.Testsection,
                seriesData={
                    'testsectiontitle': section,
                    'chaptercnt': chaptercnt,
                    'sectioncnt': sectioncnt,
                    'sectiondescription': sectdesc,
                    'sectioninstructionicon': tests.sectioninstructionicon,
                    'viewBox': tests.viewBox})
            backlinkHTML = TEM.Linkback.substitute(href=backhref,
                                                linktext=backlinktitle)
            nextlinkHTML = TEM.Linknext.substitute(href=nexthref,
                                                linktext=nextlinktitle)
            bodyHTML = TEM.Body_DOMrefsheet.substitute(
                            pagetitle='<a href="index.html">clip_8</a>',
                            chapter=chapter,
                            chaptercnt="Reference Tests "+str(chaptercnt),
                            MAIN=testsectionsHTML,
                            link1=backlinkHTML,
                            link2=nextlinkHTML,
                            FOOTER=footerHTML)
            refsheetdoc = RefsheetDocument(title="clip8 | " + chapter)
            print ("    output:", outFN)
            refsheetdoc.write_file(outFN, bodyHTML)
            backhref, backlinktitle = outfile, section
            appendixsectionsHTML += alltests[infile].generateSeries(
                                        itemTEM=TEM.ReftestCore,
                                        seriesTEM=TEM.Testsection_inclHref,
                                        seriesData={
                                            'testsectiontitle': section,
                                            'testsectionhref': outfile,
                                            'chaptercnt': chaptercnt,
                                            'sectioncnt': sectioncnt})
            passingtestsHTML += alltests[infile].generateSeries(
                                        itemTEM=TEM.ReftestCore,
                                        seriesTEM=TEM.Testsection_inclHref,
                                        seriesData={
                                            'testsectiontitle': section,
                                            'testsectionhref': outfile,
                                            'chaptercnt': chaptercnt,
                                            'sectioncnt': sectioncnt},
                                        filterFn=lambda _test:
                                            (_test['expectedto'] == "pass"))
            failingtestsHTML += alltests[infile].generateSeries(
                                        itemTEM=TEM.ReftestCore,
                                        seriesTEM=TEM.Testsection_inclHref,
                                        seriesData={
                                            'testsectiontitle': section,
                                            'testsectionhref': outfile,
                                            'chaptercnt': chaptercnt,
                                            'sectioncnt': sectioncnt},
                                        filterFn=lambda _test:
                                            (_test['expectedto'] == "fail"))
            tocsectionsHTML += TEM.TOCsection.substitute(
                                        testsectiontitle=section,
                                        testsectionhref=outfile,
                                        chaptercnt=chaptercnt,
                                        sectioncnt=sectioncnt,
                                        sectioninstructionicon=
                                            tests.sectioninstructionicon,
                                        viewBox=tests.viewBox)
        else:
            print ("Sections.py mentions a non existing file:", infile)

    ### Appendix
    backlinkHTML = TEM.Linkback.substitute(href=outfile, linktext=section)
    nextlinkHTML = TEM.Linknext.substitute(href="passing.html",
                                        linktext="Expected to pass")
    bodyHTML = TEM.Body_DOMrefsheet.substitute(
                                pagetitle='<a href="index.html">clip_8</a>',
                                chapter="All Tests",
                                chaptercnt="Appendix A",
                                MAIN=appendixsectionsHTML,
                                link1=backlinkHTML,
                                link2=nextlinkHTML,
                                FOOTER=footerHTML)
    refsheetdoc = RefsheetDocument(title="clip8 | Appendix A")
    outFN = os.path.join(outDIRabs, "appendix.html")
    print ("    output:", outFN)
    refsheetdoc.write_file(outFN, bodyHTML)

    ### passing.html
    backlinkHTML = TEM.Linkback.substitute(href="appendix.html",
                                        linktext="All Tests")
    nextlinkHTML = TEM.Linknext.substitute(href="failing.html",
                                        linktext="Expected to fail")
    bodyHTML = TEM.Body_DOMrefsheet.substitute(
                        pagetitle='<a href="index.html">clip_8</a>',
                        chapter="Expected to pass",
                        chaptercnt="Appendix B",
                        MAIN=TEM.passingtestsExplainHTML+passingtestsHTML,
                        link1=backlinkHTML,
                        link2=nextlinkHTML,
                        FOOTER=footerHTML)
    refsheetdoc = RefsheetDocument(title="clip8 | Appendix B")
    outFN = os.path.join(outDIRabs, "passing.html")
    print ("    output:", outFN)
    refsheetdoc.write_file(outFN, bodyHTML)

    ### failing.html
    backlinkHTML = TEM.Linkback.substitute(href="passing.html",
                                        linktext="Expected to pass")
    nextlinkHTML = TEM.Linknext.substitute(href="gfxelems.html",
                                        linktext="Graphical elemements")
    bodyHTML = TEM.Body_DOMrefsheet.substitute(
                        pagetitle='<a href="index.html">clip_8</a>',
                        chapter="Expected to fail",
                        chaptercnt="Appendix C",
                        MAIN=TEM.failingtestsExplainHTML+failingtestsHTML,
                        link1=backlinkHTML,
                        link2=nextlinkHTML,
                        FOOTER=footerHTML)
    refsheetdoc = RefsheetDocument(title="clip8 | Appendix C")
    outFN = os.path.join(outDIRabs, "failing.html")
    print ("    output:", outFN)
    refsheetdoc.write_file(outFN, bodyHTML)

    ### Graphical elements
    ### gfxelems.html
    exampledefinitions = SCT.exampleelements
    exampledefinitions.reverse()
    oldsection=""
    sectioncnt = 0
    mainHTML = ""
    print("Processing example collections:")
    while len(exampledefinitions) > 0:
        section, collection, infile, expectedISCD = exampledefinitions.pop()
        if section != oldsection:
            sectioncnt += 1
            mainHTML += TEM.Testsection_H3heading.substitute(
                                chaptercnt="D",
                                sectioncnt=sectioncnt,
                                testsectiontitle=section)
        inFN = os.path.join(inDIRabs, infile)
        colID = os.path.splitext(infile)[0]
        if os.path.isfile(inFN):
            printid = colID + " "*max(0, 60-len(colID))
            printdescr = collection[:min(len(colID), 40)]
            printdescr += " "* max(0, (40-len(printdescr)))
            print ("  [ %60s ] %s (exexpectedISCD=%s)"
                % (printid, printdescr, expectedISCD))
            excol = ExampleCollection(inFN, strictsubstitute=True)
            mainHTML += excol.generateSeries(
                                itemTEM=TEM.ExampleCollection,
                                seriesTEM=TEM.ExampleCollections,
                                itemData={
                                    'examplecollection_id': colID,
                                    'testdescription': collection,
                                    'testtype': "element_ISCDdetection",
                                    'expectedresult': expectedISCD,
                                    'viewBox': excol.viewBox,
                                    'width': "150px"})
        else:
            print("    ...ignored!", inFN)
        oldsection = section
    nextlinkHTML = ""
    backlinkHTML = TEM.Linkback.substitute(href="failing.html",
                                        linktext="Expected to fail")
    bodyHTML = TEM.Body_DOMrefsheet.substitute(
                                pagetitle='<a href="index.html">clip_8</a>',
                                chapter="Graphics Elements and SVG Editors",
                                chaptercnt="Appendix D",
                                MAIN=mainHTML,
                                link1=backlinkHTML,
                                link2=nextlinkHTML,
                                FOOTER=footerHTML)
    refsheetdoc = RefsheetDocument(title="clip8 | Appendix D")
    outFN = os.path.join(outDIRabs, "gfxelems.html")
    print ("    output:", outFN)
    refsheetdoc.write_file(outFN, bodyHTML)

    ### index.html
    tocsectionsHTML = TEM.TOCchapter.substitute(
        chapter="""<a href="introduction.html">Introduction</a>""",
        chaptercnt="0") + tocsectionsHTML
    tocsectionsHTML += TEM.TOCchapter.substitute(
        chapter="Appendix",
        chaptercnt="_")
    tocsectionsHTML += TEM.TOCsection.substitute(
        testsectiontitle="All Tests",
        testsectionhref="appendix.html",
        chaptercnt="A",
        sectioncnt="",
        sectioninstructionicon="",
        viewBox="1 1 2 2")
    tocsectionsHTML += TEM.TOCsection.substitute(
        testsectiontitle="Expected to pass",
        testsectionhref="passing.html",
        chaptercnt="B",
        sectioncnt="",
        sectioninstructionicon="",
        viewBox="1 1 2 2")
    tocsectionsHTML += TEM.TOCsection.substitute(
        testsectiontitle="Expected to fail",
        testsectionhref="failing.html",
        chaptercnt="C",
        sectioncnt="",
        sectioninstructionicon="",
        viewBox="1 1 2 2")
    tocsectionsHTML += TEM.TOCsection.substitute(
        testsectiontitle="Graphics Elements and SVG Editors",
        testsectionhref="gfxelems.html",
        chaptercnt="D",
        sectioncnt="",
        sectioninstructionicon="",
        viewBox="1 1 2 2")
    backlinkHTML = TEM.Linkback.substitute(
            href="https://github.com/broesamle/clip_8",
            linktext="Project page on github")
    nextlinkHTML = TEM.Linknext.substitute(
            href="introduction.html",
            linktext="Introduction")
    footerintroHTML = TEM.FooterIntro.substitute(
            refsheet_version=SCT.refsheet_version,
            refsheet_description=SCT.refsheet_description)
    bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                                chapter="Table of Contents",
                                chaptercnt="Reference Tests",
                                MAIN=tocsectionsHTML,
                                link1=backlinkHTML,
                                link2=nextlinkHTML,
                                FOOTER=footerintroHTML)
    refsheetdoc = Classic_Clip8Page(title="clip8 | Reference Tests")
    outFN = os.path.join(outDIRabs, "index.html")
    print ("    output:", outFN)
    refsheetdoc.write_file(outFN, bodyHTML, supress_clip8scripts=True)

    ### introduction.html
    # FIXME: Make a proper template rather than re-using the test section template.


    backlinkHTML = TEM.Linkback.substitute(href="index.html",
                                        linktext="Table of Contents")
    nextlinkHTML = TEM.Linknext.substitute(href=firstoutfile,
                                        linktext=firstsection)
    bodyHTML = TEM.Body.substitute(pagetitle="clip_8",
                                chapter="Introduction",
                                chaptercnt="Reference Tests",
                                MAIN=TEM.introHTML,
                                link1=backlinkHTML,
                                link2=nextlinkHTML,
                                FOOTER=footerintroHTML)
    refsheetdoc = Classic_Clip8Page(title="clip8 | Reference Tests")
    outFN = os.path.join(outDIRabs, "introduction.html")
    print ("    output:", outFN)
    refsheetdoc.write_file(outFN, bodyHTML, supress_clip8scripts=True)
