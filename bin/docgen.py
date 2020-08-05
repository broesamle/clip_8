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
<!-- Clip8Document._pretem -->
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

    _initscripts_tem = """
<!-- Clip8Document._initscripts_tem -->
<script src="../lib/kd-tree-javascript/kdTree-min.js"></script>
<script src="../lib/clip8dependencies.js"></script>
<script src="../js/svgdom.js"></script>
<script src="../js/svginterval.js"></script>
<script src="../js/svgretrieve.js"></script>
<script src="../js/paperclip.js"></script>
<script src="../js/clip8decode.js"></script>
<script src="../js/clip8.js"></script>
$addscripts
<script>
var WASM_READY = false;
var Module = {
    wasmBinaryFile: "../rs/wasm/iscd.wasm",
    onRuntimeInitialized: main,
    noInitialRun: true,     // seems necessary to use the module after main
    noExitRuntime: true
};

function clip8initinstructions () { $initinstruct }

function main () {
    WASM_READY = true;
    clip8initinstructions();
}
</script>
<script src="../rs/wasm/iscd.js"></script>
"""

    def __init__(self, title,
                 cssfiles=[], jsfiles=[], head_opener="", head_final=""):
        """ Create one document with title, included files, etc.

        `title`: The title for the meta info

        `cssfiles`: List of css files to be included via link in the header.

        `jsfiles`: List of additional js files to be included.
            The clip8 scripts are added automatically.

        `head_opener`, `head_final`:
            For additional code snippets at start/end of the <head>.
        """
        self.title = title
        self.head_opener = head_opener
        self.cssfiles = cssfiles
        self.jsfiles = jsfiles
        self.head_final = head_final
        self.clip8initinstruct = ""
        self.addscripts = ""

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
                                                  jsfiles_str,
                                                  cssfiles_str,
                                                  self.head_final)
        self._doctemplate = Template(templatestring)
        if supress_clip8scripts:
            scripts = ""
        else:
            scripts = Template(Clip8Document._initscripts_tem).substitute(
                        initinstruct=self.clip8initinstruct,
                        addscripts=self.addscripts)
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
    _initinstr_autoplay = """
    Clip8controler.init(
                document.getElementById("clip8svgroot"),
                true, true, false,
                function () {},
                Clip8controler.playAction);
"""

    def __init__(self, *args, cssfiles=[], autoplay=False, **kwargs):
        """
        `autoplay`: Play immedeately after loading page.
            Cannot be combined with `interactive_loader=True`.
            Default is `False`.`
        """

        super().__init__(*args,
                         cssfiles=["../css/refsheet.css",
                                   "../css/clip8.css"] + cssfiles,
                         **kwargs)
        if autoplay:
            self.clip8initinstruct = Classic_Clip8Page._initinstr_autoplay

class Clip8UIDocument(Clip8Document):
    """ A clip8 document with interactive user controls. """

    _initinstruct = Template ("""
    let c8root = document.getElementById("clip8svgroot");
    let c8controls = document.getElementById("c8ui_controls");
    let termination_callback_user = $termination_callback;
    let termination_callback_c8ui = function (status, cycles, history) {
        Clip8UI.terminate();
        termination_callback_user(status, cycles, history);
    };
    let initloadedclip8 = function () {
        Clip8controler.init(c8root, true, true, false,
                            termination_callback=termination_callback_c8ui);
        Clip8UI.init(c8play=Clip8controler.playAction,
                     c8pause=Clip8controler.pauseAction,
                     c8step=Clip8controler.stepAction,
                     c8root=c8root,
                     controls=c8controls);
        Clip8UI.getready();
    };
    $load
    $reload
    """)

    _load_interactive = """svgloader.init(
                document.getElementById("filechooser"),
                initloadedclip8);"""

    _reload_interactive = """
    let reloadbt = document.getElementById("c8ui_reload_btn");
    reloadbt.addEventListener('click', svgloader.reload);
    reloadbt.onclick = null;
    """

    def __init__(self,
                 *args,
                 interactive_loader=False,
                 jsfiles=[],
                 cssfiles=[],
                 termination_callback="function () {}",
                 **kwargs):
        """
        `interactive_loader`: If set to `True` the user will be able to
            load own svg documents via drag+drop and via file choose dialogue.
            Default is `False`.

        `termination_callback`: Will be called when clip8 execution terminates.
            Typically this is used to let the UI take notice of the
            execution end (with or without error).
        """
        if interactive_loader:
            _jsfiles = [
                "../lib/javascript-state-machine/state-machine.min.js",
                "../js/clip8ui.js",
                "../js/svgloader.js"]
            _reload = Clip8UIDocument._reload_interactive
            _load = Clip8UIDocument._load_interactive
        else:
            _jsfiles = [
                "../lib/javascript-state-machine/state-machine.min.js",
                "../js/clip8ui.js"]
            _reload = ""    ## stick to the default
            _load = "initloadedclip8();"
        _cssfiles = ["../css/c8ui.css"]
        super().__init__(*args,
                jsfiles=jsfiles+_jsfiles,
                cssfiles=_cssfiles+cssfiles,
                **kwargs)
        self.clip8initinstruct = Clip8UIDocument._initinstruct.substitute(
                            termination_callback=termination_callback,
                            reload=_reload,
                            load=_load);
