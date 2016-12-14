import xml.etree.ElementTree as ET

from PyBroeModules.StripNamespace import stripNamespace, stripNamespaceFromTag
from PyBroeModules.ItemsCollectionA import ItemsCollection

def allChildrenToSVG(el):
    return u"".join ( [ stripNamespace(ET.tostring(child, encoding='utf-8').decode('utf8')) for child in el ] )

class XMLNodesCollection(ItemsCollection):
    """ Read a number of nodes from an XML file"""
    def __init__(self, filename, elementXpath, namespaces={}, reverse=False, *args, **kwargs):
        ItemsCollection.__init__(self, *args, **kwargs)
        tree = ET.parse(filename)
        root = tree.getroot()
        self.processSVGRoot(root)
        for el in root.findall(elementXpath, namespaces):
            self.processElement(el)

    def processSVGRoot(self, svgroot):
        print ("Process SVG root element:", svgroot)
        self.viewBox = svgroot.attrib['viewBox']
        self.width = svgroot.attrib['width']
        self.height = svgroot.attrib['height']

    def processElement(self,el):
        """ PLEASE OVERLOAD! The default implementation derives the key from the node id and adds the xml in the field `XML_CONTENT`."""
        raise NotImplementedError()

#FIXME: `SVGGroupCollection.generateSeries` should provide document wide fields cf. #52
# https://github.com/broesamle/clip_8/issues/52

class SVGGroupCollection(XMLNodesCollection):
    """ Collect SVG groups by prefixes in the element's id `<g id="someprefix_. . ."></g>`."""
    def __init__(self, filename, idprefixes, *args, **kwargs):
        self.prefixes = idprefixes
        XMLNodesCollection.__init__(self,
            filename, elementXpath='.//svg:g[@id]',
            namespaces = {'svg':'http://www.w3.org/2000/svg'}, *args, **kwargs)

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
