from collections import OrderedDict

refsheet_version = "0.0.9"
refsheet_description = "encompasses a usable (incomplete) language repertoire."

sections = [
    ("Iconic Instruction Language", "Control flow", 'test_controlflow.svg'),
    ("Iconic Instruction Language", "Selectors", 'test_selectors.svg'),
    ("Iconic Instruction Language", "Combining Instructions", 'test_combine-instructions.svg'),
    ("Paper inspired Operations", "Align relative", 'test_alignrel.svg'),
    ("Paper inspired Operations", "Align absolute", 'test_alignabs.svg'),
    ("Paper inspired Operations", "Move by vector (relative)", 'test_moverel.svg'),
    ("Paper inspired Operations", "Move to location (absolute)", 'test_moveabs.svg'),
    ("Paper inspired Operations", "Create and destroy", 'test_create+destroy.svg'),
    ("Changing dimensions", "Scale and resize", 'test_scale+resize.svg') ]

expected_to_fail = [
    "disturbing-path2",
    "indirect1", "indirect2", "indirect3",
    "move-bysize-down", "move-bysize-down2",
    "moveto-lowerleft", "moveto-lowerleft2", "moveto-upperleft",
    "clone1", "cut-vertical", "delete1", "delete2",
    "scale1", "grow-upper", "grow-right", "setheight", "setheight-indir"
    ]

demos = [
    ("Counter Example 1", "counter1.svg"),
    ("Counter Example 2", "counter2.svg")]
