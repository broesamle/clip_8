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


import codecs
from string import Template

class Clip8Document:
    """ Generate a minimal clip_8 document."""

    _pretem = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>%s</title>
%s
$initclip8scripts
%s
%s
%s
</head>
$body
</html>
"""

    _pretem_scripts = initclip8scripts = """
<!-- CommonTemplates.DependClip8_str -->
<script src="../lib/kd-tree-javascript/kdTree-min.js"></script>
<script src="../lib/clip8dependencies.js"></script>
<script src="../js/svgdom.js"></script>
<script src="../js/svginterval.js"></script>
<script src="../js/svgretrieve.js"></script>
<script src="../js/paperclip.js"></script>
<script src="../js/clip8decode.js"></script>
<script src="../js/clip8.js"></script>
<script>
var WASM_READY = false;
var Module = {
    wasmBinaryFile: "../rs/wasm/iscd.wasm",
    onRuntimeInitialized: main,
    noInitialRun: true,     // seems necessary to use the module after main
    noExitRuntime: true
};

function main () {
    WASM_READY = true;
}
</script>
<script src="../rs/wasm/iscd.js"></script>
"""

    def __init__(self, title,
                 cssfiles=[], jsfiles=[], head_opener="", head_final=""):
        """ Create one document with title, included files, etc.

        `title`: The title for the meta info

        `cssfiles`: List of css files to be included via link in the header.

        `cssfiles`: List of additional js files to be included.
            The clip8 scripts are added automatically.
        """
        self.title = title
        self.head_opener = head_opener
        self.cssfiles = cssfiles
        self.jsfiles = jsfiles
        self.head_final = head_final

    def as_html_str(self, body_html, supress_clip8scripts=False):
        """ Output the html document with a given body.
        `body_html`: String with body html with enclosing body tags.
            "<body>....</body>"

        `supress_clip8scripts`: By default, this setting is `False` so that
            clip8 init scripts will be included in the output.
            By setting this option to `True` the output is suppressed, e.g.
            for introductory text pages in the reference sheets.
        """
        cssfiles_str = "\n".join(
            [('<link rel="stylesheet" href="%s">' % s) for s in self.cssfiles])
        jsfiles_str = "\n".join(
            [('<script src="%s"></script>' % s) for s in self.jsfiles])
        templatestring = Clip8Document._pretem % (self.title,
                                                  self.head_opener,
                                                  cssfiles_str,
                                                  jsfiles_str,
                                                  self.head_final)
        self._doctemplate = Template(templatestring)
        if supress_clip8scripts:
            scripts = ""
        else:
            scripts = Clip8Document._pretem_scripts
        return self._doctemplate.substitute(body=body_html,
                                            initclip8scripts=scripts)

    def write_file(self, filename, *args, **kwargs):
        """ Like `as_html_str`, output to a file.

        `filename`: Output file name as a string.
        """
        output_file = codecs.open(filename, "w",
                                  encoding="utf-8",
                                  errors="xmlcharrefreplace")
        output_file.write(self.as_html_str(*args, **kwargs))
        output_file.close()

class Classic_Clip8Page(Clip8Document):
    def __init__(self, *args, cssfiles=[], **kwargs):
        super().__init__(*args,
                         cssfiles=["../css/refsheet.css", "../css/clip8.css"] + cssfiles,
                         **kwargs)
