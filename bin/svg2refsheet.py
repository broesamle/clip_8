import os, io, codecs
import xml.etree.ElementTree as ET

from PyBroeModules.ItemsCollectionA import ItemsCollection
from PyBroeModules.StripNamespace import stripNamespace

import RefsheetTemplates as TEM

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

tests = SVGGroupCollection(
    os.path.join("..","svg","TEST-prototypeAI1.svg"),
    "TEST-",
    defaults={'testdescription':"--TEST-DESCRIPTION-TBA--", 'testid':"--TEST-ID-TBA--", 'post':"--POST--", 'testDOM':"--TEST--" },
    strictsubstitute=True)

testsectionsHTML = tests.generateSeries(
    itemTEM=TEM.SingleReferenceTest,
    seriesTEM=TEM.Testsection,
    seriesData={'testsectiontitle':"--TEST-SECTION-TITLE-TBA--"}
    )

bodyHTML = TEM.Body.substitute(refsheettitle="Title t.b.a.", TESTSECTIONS=testsectionsHTML)
headerHTML = TEM.Header.substitute(refsheettitle="Title t.b.a.")
documentHTML = TEM.Document.substitute(HEADER=headerHTML,BODY=bodyHTML)
output_file = codecs.open(os.path.join("..","tests", "test_prototypeAI1.html"), "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
