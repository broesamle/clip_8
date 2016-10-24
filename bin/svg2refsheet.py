import os, io
from PyBroeModules.ItemsCollectionA import ItemsCollection
import xml.etree.ElementTree as ET

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
    def __init__(self, idprefix):
        self.prefix = idprefix
        XMLNodesCollection.__init__(self, os.path.join("..","svg","TEST-prototypeAI1.svg"), elementXpath='.//svg:g[@id]', namespaces = {'svg':'http://www.w3.org/2000/svg'})

    def keyFromId(self,id):
        """ Check whether the id is valid, and then generate a key for the item from it.
            The default case checks the presence of the prefix and removes it. """
        if id.startswith(self.prefix):
            return id[len(self.prefix):]
        else:
            raise ValueError("Invalid ID: "+id+" pre:"+self.prefix)

    def processElement(self, el):
        try:
            id = self.keyFromId(el.get('id',""))
            self.addItem(id,{ 'SVG_CONTENT' : stripNamespace(ET.tostring(el,encoding='utf8',method='xml')) })
        except ValueError:
            pass

col = SVGGroupCollection("TEST-")