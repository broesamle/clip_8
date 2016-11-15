import os, io, codecs, fnmatch
import xml.etree.ElementTree as ET

from PyBroeModules.ItemsCollectionA import ItemsCollection
from PyBroeModules.StripNamespace import stripNamespace

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
                else:
                    print("WARNING: Encountered invalid sublayer %s in test %s." % (child.get('id',"--unknown--"),id))
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
while len(SCT.sections) > 0:
    chapter, section, infile = SCT.sections.pop()
    if len(SCT.sections) > 0:
        _, nextlinktitle, nexthref = SCT.sections[-1]
        nexthref = outprefix+os.path.splitext(nexthref)[0]+outsuffix+'.'+outext
    else:
        nexthref, nextlinktitle = "reference-tests_overview.html", "Appendix"
    outfile = outprefix+os.path.splitext(infile)[0]+outsuffix+'.'+outext
    inFN = os.path.join(inDIRabs, infile)
    outFN = os.path.join(outDIRabs, outfile)
    if os.path.isfile(inFN):
        print("Processing", infile, 'BACK:', backhref, 'next:', nexthref)
        if chapter == lastchapter:
            sectioncnt += 1
        else:
            chaptercnt += 1
            sectioncnt = 1
            lastchapter = chapter
        tests = SVGGroupCollection(
            inFN,
            "TEST-",
            defaults={'testdescription':"--TEST-DESCRIPTION-TBA--", 'testid':"--TEST-ID-TBA--", 'post':"--POST--", 'testDOM':"--TEST--" },
            strictsubstitute=True)
        alltests[infile] = tests

        testsectionsHTML = tests.generateSeries(
            itemTEM=TEM.SingleReferenceTest,
            seriesTEM=TEM.Testsection,
            seriesData={'testsectiontitle':section, 'testsectioncounter':str(sectioncnt)}
            )

        backlinkHTML = TEM.Linkback.substitute(href=backhref, linktext=backlinktitle)
        nextlinkHTML = TEM.Linknext.substitute(href=nexthref, linktext=nextlinktitle)

        bodyHTML = TEM.Body.substitute(pagetitle="clip_8", chapter=chapter, chaptercnt="Chapter "+str(chaptercnt), TESTSECTIONS=testsectionsHTML, link1=backlinkHTML, link2=nextlinkHTML)
        headerHTML = TEM.Header.substitute(refsheettitle="tba", dependencies=TEM.DependJasmine_str+TEM.DependClip8_str)
        documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML)
        output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
        output_file.write(documentHTML)
        output_file.close()
        backhref, backlinktitle = outfile, section

        appendixsectionsHTML += alltests[infile].generateSeries(
            itemTEM=TEM.SingleReferenceTest_light,
            seriesTEM=TEM.Testsection_inclHref,
            seriesData={'testsectiontitle':section, 'testsectionhref':outfile, 'testsectioncounter':sectioncnt}
            )
    else:
        print ("Sections.py mentions a non existing file:", infile)

backlinkHTML = TEM.Linkback.substitute(href=outfile, linktext=section)
bodyHTML = TEM.Body.substitute(pagetitle="clip_8", chapter="Appendix", chaptercnt="Appendix A", TESTSECTIONS=appendixsectionsHTML, link1=backlinkHTML, link2="")
headerHTML = TEM.Header.substitute(refsheettitle="tba", dependencies=TEM.DependJasmine_str+TEM.DependClip8_str)
documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML)

outFN = os.path.join(outDIRabs, "reference-tests_overview.html")
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
