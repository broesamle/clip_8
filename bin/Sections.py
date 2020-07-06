#
#   clip_8 interpreter; iconic language for paper-inspired operations.
#   Copyright (C) 2016, 2017  Martin Brösamle
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.
#


from collections import OrderedDict

refsheet_version = "0.1.7"
refsheet_description = "In the process of developing a language standard."

sections = [
    ("Tree of Graphics", "Elements by type", 'tree-of-graphics-elements.svg'),
    ("Iconic Instruction Language", "Control flow", 'test_controlflow.svg'),
    ("Iconic Instruction Language", "Selectors", 'test_selectors.svg'),
    ("Iconic Instruction Language", "Parameters", 'test_selectors-param.svg'),
    ("Iconic Instruction Language", "Combining Instructions", 'test_combine-instructions.svg'),
    ("Iconic Instruction Language", "The order of things", 'test_orderofthings.svg'),
    ("Paper inspired Operations", "Align relative", 'test_alignrel.svg'),
    ("Paper inspired Operations", "Align absolute", 'test_alignabs.svg'),
    ("Paper inspired Operations", "Move by vector (relative)", 'test_moverel.svg'),
    ("Paper inspired Operations", "Move to location (absolute)", 'test_moveabs.svg'),
    ("Paper inspired Operations", "Create and destroy", 'test_create+destroy.svg'),
    ("Changing dimensions", "Scale and resize", 'test_scale+resize.svg') ]

expected_to_fail = [
    "selector-precision-similarrects3",
    "moveto-lowerleft", "moveto-lowerleft2", "moveto-upperleft",
    "cut-vertical",
    "grow-upper", "grow-right", "setheight", "setheight-indir"
    ]

exampleelements = [
    ("Valid Control Flow Elements", "from illustrator", "example-elements_controlflow-valid_ai.svg", "CONTROLFLOW"),
    ("Valid Control Flow Elements", "from inkskape", "example-elements_controlflow-valid_inkscape.svg", "CONTROLFLOW"),
    ("Invalid Control Flow Elements", "from illustrator", "example-elements_controlflow-nonvalid_ai.svg", "INVALID"),
    ("Invalid Control Flow Elements", "from inkskape", "example-elements_controlflow-nonvalid_inkscape.svg", "INVALID") ]

demos = [
    ("Seasons Greetings", "christmas1.svg"),
    ("Soundcheck", "soundcheck.svg"),
    ("Happy La La (basic sequencer)", "happy-la-la.svg"),
    ("Clong (heavy representationalist version)", "clong.svg"),
    ("Counter Example", "counter3.svg"),
    ("Analog Digital Converter", "ADConverter.svg"),
    ("Loom 1", "loom1.svg"),
    ("Loom 2", "loom2.svg"),
    ("Loom 3", "loom3.svg"),
    ]
