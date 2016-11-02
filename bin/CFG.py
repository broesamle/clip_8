import os

rootDIRabs = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
refsheetsvgDIR = "refsheet-svg"
testsDIR = "tests"

testfile_ext = "html"
testfile_generatedFromSVG_suffix = "_genfromSVG"
svgtestfile_pattern = "test_*.svg"
