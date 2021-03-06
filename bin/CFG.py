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


import os

rootDIRabs = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
refsheetsvgDIR = "refsheet-svg"
svgsourceDIR = "c8svg"
demosDIR = "demos"
testsDIR = "tests"
tutorialDIR = "tutorial"
logoDIR = "tutorial"

logofile = "logo.svg"

testfile_ext = "html"
demofile_ext = "html"

tutorial_solution_suffix = "_solution"
exerciseSVG_ext = "svg"
exercisepage_ext = "html"
exerciseinstruction_ext = "mdtxt"
