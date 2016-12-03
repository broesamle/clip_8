from collections import OrderedDict

refsheet_version = "0.0.2"
refsheet_description = "encompasses a usable (incomplete) language repertoire."

sections = [
    ("Iconic Instruction Language", "Control flow", 'test_controlflow.svg'),
    ("Iconic Instruction Language", "Selectors", 'test_selectors.svg'),
    ("Paper inspired Operations", "Align relative", 'test_alignrel.svg'),
    ("Paper inspired Operations", "Align absolute", 'test_alignabs.svg'),
    ("Paper inspired Operations", "Move by vector (relative)", 'test_moverel.svg'),
    ("Paper inspired Operations", "Move to location (absolute)", 'test_moveabs.svg'),
    ("Paper inspired Operations", "Create and destroy", 'test_create+destroy.svg'),
    ("Changing dimensions", "Scale and resize", 'test_scale+resize.svg') ]

expected_to_fail = [
    "alternative-join-combo", "alternative-join-combo2", "alternative-join-combo3", "alternative-join-combo4", "alternative-join-combo5",
    "enclose2", "intersect1", "intersect2", "indirect2", "indirect2", "indirect3",
    "move-rel-v-down", "move-rel-dl", "move-bysize-down ", "move-bysize-down2",
    "moveto-lowerleft", "moveto-lowerleft2", "moveto-upperleft",
    "clone1", "cut-vertical", "delete1", "delete2",
    "scale1", "shrink-upper", "grow-upper", "grow-right", "setheight", "setheight-indir"
    ]
