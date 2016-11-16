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
    def __init__(self,filename,elementXpath,namespaces={},reverse=False,**kwargs):
        ItemsCollection.__init__(self,**kwargs)
        tree = ET.parse(filename)
        root = tree.getroot()
        for el in root.findall(elementXpath, namespaces):
            self.processElement(el)

    def processElement(self,el):
        """ PLEASE OVERLOAD! The default implementation derives the key from the node id and adds the xml in the field `XML_CONTENT`."""
        raise NotImplementedError()

class SVGGroupCollection(XMLNodesCollection):
    def __init__(self, filename, idprefix, *args, **kwargs):
        self.prefix = idprefix
        XMLNodesCollection.__init__(self, filename, elementXpath='.//svg:g[@id]', namespaces = {'svg':'http://www.w3.org/2000/svg'}, *args, **kwargs)

    def keyFromId(self,id):
        """ Check whether the id is valid, and then generate a key for the item from it.
            The default case checks the presence of the prefix and removes it. """
        if id.startswith(self.prefix):
            result = id[len(self.prefix):]
        else:
            raise ValueError("Invalid ID: "+id+" pre:"+self.prefix)
        return result

    def processElement(self, el):
        try:
            id = self.keyFromId(el.get('id',""))
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
                    print("WARNING: Encountered invalid sublayer or group %s in test %s." % (child.get('id',"--unknown--"),id))
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
                                newitem[decl.name] = decl.value.as_css()
                        except IndexError:
                            print ("Empty META Block")

                elif stripNamespaceFromTag(child.tag) == "rect":
                    pass # we don't care, illustrator puts them together with text
                else:
                    print("WARNING: UDO (unknown data object ;-) in test element:", child, child.get('id',"--unknown--"), id)
            newitem['testid'] = id
            ## TODO: extract correct bits from SVG and define `pre`, `post` and `testDOM`.
            self.addItem(id, newitem)
        except ValueError:
            pass    # ignore any elements where the id could not be translated into a key

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
        tests = SVGGroupCollection(
            inFN,
            "TEST-",
            defaults={
                'testdescription':"--TEST-DESCRIPTION-TBA--",
                'testid':"--TEST-ID-TBA--",
                'post':"--POST--",
                'testDOM':"--TEST--",
                'testtype':"--TYPE--",
                'cycles':-1},
            strictsubstitute=True)
        for thetest in tests.values():
            print ("  [", thetest['testid'], "] ", thetest['testdescription'], thetest['testtype'], thetest['cycles'])
        alltests[infile] = tests

        testsectionsHTML = tests.generateSeries(
            itemTEM=TEM.SingleReferenceTest,
            seriesTEM=TEM.Testsection,
            seriesData={'testsectiontitle':section, 'chaptercnt':chaptercnt, 'sectioncnt':sectioncnt}
            )

        backlinkHTML = TEM.Linkback.substitute(href=backhref, linktext=backlinktitle)
        nextlinkHTML = TEM.Linknext.substitute(href=nexthref, linktext=nextlinktitle)

        bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>', chapter=chapter, chaptercnt="Chapter "+str(chaptercnt), TESTSECTIONS=testsectionsHTML, link1=backlinkHTML, link2=nextlinkHTML)
        headerHTML = TEM.Header.substitute(dependencies=TEM.DependJasmine_str+TEM.DependClip8_str, chapter=chapter)
        documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML, chapter=chapter)
        output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
        output_file.write(documentHTML)
        output_file.close()
        backhref, backlinktitle = outfile, section

        appendixsectionsHTML += alltests[infile].generateSeries(
            itemTEM=TEM.SingleReferenceTest_light,
            seriesTEM=TEM.Testsection_inclHref,
            seriesData={'testsectiontitle':section, 'testsectionhref':outfile, 'chaptercnt':chaptercnt, 'sectioncnt':sectioncnt}
            )

        tocsectionsHTML += TEM.TOCsection.substitute(
            testsectiontitle=section,
            testsectionhref=outfile,
            chaptercnt=chaptercnt,
            sectioncnt=sectioncnt)
    else:
        print ("Sections.py mentions a non existing file:", infile)

backlinkHTML = TEM.Linkback.substitute(href=outfile, linktext=section)
bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>', chapter="All tests", chaptercnt="Appendix A", TESTSECTIONS=appendixsectionsHTML, link1=backlinkHTML, link2="")
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
    sectioncnt="")

backlinkHTML = TEM.Linkback.substitute(href="index.html", linktext="Introduction")
nextlinkHTML = TEM.Linknext.substitute(href=firstoutfile, linktext=firstsection)
bodyHTML = TEM.Body.substitute(pagetitle='clip_8', chapter="Table of Contents", chaptercnt="", TESTSECTIONS=tocsectionsHTML, link1=backlinkHTML, link2=nextlinkHTML)
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
<a href="toc.html">Table of Contents<br>&gt;&gt;&gt;&gt;&gt;</a>
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
Powered by Jasmine, SVG, Javascript, and the DOM.
</p>
<p>
© 2016, Martin Brösamle.<br>
All rights reserved.
</p>
"""
bodyHTML = TEM.Body.substitute(pagetitle="clip_8", chapter="Introduction", chaptercnt="", TESTSECTIONS=contentHTML, link1="", link2="")
headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Introduction")
documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "index.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
