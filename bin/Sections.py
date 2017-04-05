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

refsheet_version = "0.0.15"
refsheet_description = "encompasses a usable (incomplete) language repertoire."

sections = [
    ("Iconic Instruction Language", "Control flow", 'test_controlflow.svg'),
    ("Iconic Instruction Language", "Selectors", 'test_selectors.svg'),
    ("Iconic Instruction Language", "Combining Instructions", 'test_combine-instructions.svg'),
    ("Iconic Instruction Language", "The order of things", 'test_orderofthings.svg'),
    ("Paper inspired Operations", "Align relative", 'test_alignrel.svg'),
    ("Paper inspired Operations", "Align absolute", 'test_alignabs.svg'),
    ("Paper inspired Operations", "Move by vector (relative)", 'test_moverel.svg'),
    ("Paper inspired Operations", "Move to location (absolute)", 'test_moveabs.svg'),
    ("Paper inspired Operations", "Create and destroy", 'test_create+destroy.svg'),
    ("Changing dimensions", "Scale and resize", 'test_scale+resize.svg') ]

expected_to_fail = [
    "disturbing-path2",
    "indirect1", "indirect2", "indirect3",
    "ordered-clone-move1", "ordered-clone-move2",
    "move-bysize-down", "move-bysize-down2",
    "moveto-lowerleft", "moveto-lowerleft2", "moveto-upperleft",
    "cut-vertical",
    "scale1", "grow-upper", "grow-right", "setheight", "setheight-indir"
    ]

demos = [
    ("Counter Example 3", "counter3.svg"),
    ("Seasons Greetings", "christmas1.svg"),
    ("Loom 1", "loom1.svg"),
    ("Loom 2", "loom2.svg"),
    ("Loom 3", "loom3.svg"),
    ("Loom 4", "loom4.svg"),
    ("Analog Digital Converter", "ADConverter.svg")]
