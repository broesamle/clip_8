import os, io, codecs, fnmatch
from tinycss.css21 import CSS21Parser
import xml.etree.ElementTree as ET

from PyBroeModules.ItemsCollectionA import ItemsCollection
from PyBroeModules.StripNamespace import stripNamespace, stripNamespaceFromTag

import RefsheetTemplates as TEM
import Sections as SCT
import CFG

inDIRabs = os.path.join(CFG.rootDIRabs, CFG.refsheetsvgDIR)
outDIRabs = os.path.join(CFG.rootDIRabs, CFG.testsDIR)
outprefix = ""
outsuffix = CFG.testfile_generatedFromSVG_suffix
outext = CFG.testfile_ext

def allChildrenToSVG(el):
    return u"".join ( [ stripNamespace(ET.tostring(child, encoding='utf-8').decode('utf8')) for child in el ] )

class XMLNodesCollection(ItemsCollection):
    """ Read a number of nodes from an XML file"""
    def __init__(self, filename, elementXpath, namespaces={}, reverse=False, **kwargs):
        ItemsCollection.__init__(self, **kwargs)
        tree = ET.parse(filename)
        root = tree.getroot()
        for el in root.findall(elementXpath, namespaces):
            self.processElement(el)
    def processElement(self,el):
        """ PLEASE OVERLOAD! The default implementation derives the key from the node id and adds the xml in the field `XML_CONTENT`."""
        raise NotImplementedError()

class SVGGroupCollection(XMLNodesCollection):
    """ Collect SVG groups by prefixes in the element's id `<g id="someprefix_. . ."></g>`."""
    def __init__(self, filename, idprefixes, *args, **kwargs):
        self.prefixes = idprefixes
        XMLNodesCollection.__init__(self, filename, elementXpath='.//svg:g[@id]', namespaces = {'svg':'http://www.w3.org/2000/svg'}, *args, **kwargs)

    def keyFromId(self,id):
        """ Check whether the id has one of the prefixes, and then generate a key for the item from it.
            The default case checks the presence of the prefix and removes it.
            No prefix should be prefix of other prefixes; the first hit wins.
            """
        for prefix in self.prefixes:
            if id.startswith(prefix):
                key = id[len(prefix):]
                if key in self:
                    raise ValueError("Generated key already exists in collection:", key, id)
                else:
                    return key
        raise ValueError("Invalid ID: "+id+" pre:"+prefix)

    def processElement(self, el):
        """ Please overload this method.
            It just adds a string to demonstrate what it could do."""
        id = self.keyFromId(el.get('id',""))
        newitem = "Create something useful to be added as item!"
        self.addItem(id, newitem)

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
            newitem['expectedtofail'] = key in SCT.expected_to_fail
            self.addItem(key, newitem)

appendixsectionsHTML = ""
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
            print ( "  [ %10s ] %s (%s) (%s)" % (printid, printdescr, thetest['testtype'], {True:"fail", False:"pass"}[thetest['expectedtofail']]) )
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

        tocsectionsHTML += TEM.TOCsection.substitute(
            testsectiontitle=section,
            testsectionhref=outfile,
            chaptercnt=chaptercnt,
            sectioncnt=sectioncnt,
            sectioninstructionicon=tests.sectioninstructionicon)
    else:
        print ("Sections.py mentions a non existing file:", infile)

backlinkHTML = TEM.Linkback.substitute(href=outfile, linktext=section)
footerHTML = TEM.FooterRefsheet.substitute(refsheet_version=SCT.refsheet_version)
bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>',
                               chapter="All tests", chaptercnt="Appendix A",
                               TESTSECTIONS=appendixsectionsHTML,
                               link1=backlinkHTML, link2="",
                               FOOTER=footerHTML)

headerHTML = TEM.Header.substitute(dependencies=TEM.DependJasmine_str+TEM.DependClip8_str, chapter="Appendix A")
documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "appendix.html")
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

backlinkHTML = TEM.Linkback.substitute(href="index.html", linktext="Introduction")
nextlinkHTML = TEM.Linknext.substitute(href=firstoutfile, linktext=firstsection)
footerHTML = TEM.FooterRefsheet.substitute(refsheet_version=SCT.refsheet_version)
bodyHTML = TEM.Body.substitute(pagetitle='clip_8',
                               chapter="Table of Contents", chaptercnt="",
                               TESTSECTIONS=tocsectionsHTML,
                               link1=backlinkHTML, link2=nextlinkHTML,
                               FOOTER=footerHTML)
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter=chapter)
documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML)

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
<b>How to read a reference sheet:</b>
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
footerHTML = TEM.FooterIntro.substitute(refsheet_version=SCT.refsheet_version, refsheet_description=SCT.refsheet_description)
bodyHTML = TEM.Body.substitute(pagetitle="clip_8",
                               chapter="Introduction",
                               chaptercnt="",
                               TESTSECTIONS=contentHTML,
                               link1="", link2="",
                               FOOTER=footerHTML)
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Introduction")
documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
