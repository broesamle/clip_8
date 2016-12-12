import os, io, codecs, fnmatch
from tinycss.css21 import CSS21Parser

import DemoTemplates as TEM
from SVGHandling import *
import Sections as SCT
import CFG

class DemoPage(SVGGroupCollection):
    def __init__(self, filename, *args, **kwargs):
        #self.viewBox = viewBox
        SVGGroupCollection.__init__(
            self,
            filename,
            idprefixes=["clip8"],
            defaults={},
            *args, **kwargs)

    def processElement(self, el):
        elid = el.get('id',"")
        try:
            key = self.keyFromId(elid)
        except ValueError:
            return    # ignore any elements where the id could not be translated into a key       newitem = {}
        newitem = {}
        newitem['svgdata'] = allChildrenToSVG(el)
        self.addItem(key, newitem)

inDIRabs = os.path.join(CFG.rootDIRabs, CFG.demosDIR)
outDIRabs = os.path.join(CFG.rootDIRabs, CFG.demosDIR)
inFN = os.path.join(inDIRabs, "counter1.svg")
outFN = os.path.join(outDIRabs, "counter1.html")

print("Processing:", inFN)
demopage = DemoPage(inFN, strictsubstitute=True)

demosHTML = demopage.generateSeries(
    itemTEM=TEM.Demo, 
    seriesTEM=TEM.Demos, 
    itemData={'viewBox': "0 0 256 168"})
footerHTML = TEM.Footer
bodyHTML = TEM.Body.substitute(pagetitle='<a href="toc.html">clip_8</a>',
                                        chapter="Counter", chaptercnt="Demos",
                                        DEMOS=demosHTML,
                                        link1="", link2="",
                                        FOOTER=footerHTML)

headerHTML = TEM.Header.substitute(dependencies=TEM.DependClip8_str, chapter="Counter Example ; )")
documentHTML = TEM.Document.substitute(HEADER=headerHTML, BODY=bodyHTML)
output_file = codecs.open(outFN, "w", encoding="utf-8", errors="xmlcharrefreplace")
output_file.write(documentHTML)
output_file.close()
