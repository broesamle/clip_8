/*
    clip_8 interpreter; iconic language for paper-inspired operations.
    Copyright (C) 2016, 2017  Martin Brösamle

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//var loaded_svgdocument;

"use strict";

var CLIP8_SVG_ROOT_ID = "clip8svgroot";
var CLIP8_EXECROOT_ID = "clip8"

var dropZone = document.getElementById(CLIP8_SVG_ROOT_ID);
var fileChooser = document.getElementById('filechooser');
var highlightISCCheckbox = document.getElementById("hightlightISC");
var lastloadedSVG = undefined;

function insertSVG(newsvgroot) {
    var svgroot = document.getElementById(CLIP8_SVG_ROOT_ID);
    // clear the existing svg root
    Clip8controler.pauseAction(); // we do not wand a clip_8 engine to operate on a DOM we are just changing.
    while (svgroot.firstChild) {
        svgroot.removeChild(svgroot.firstChild);
    }
    svgroot.setAttribute('viewBox', newsvgroot.getAttribute('viewBox'));
    var movingchild = newsvgroot.firstChild;
    while (movingchild) {
        console.info("Moving child: ", movingchild)
        svgroot.appendChild(movingchild.cloneNode(true));
        movingchild = movingchild.nextSibling;
    }
    console.log("XXX", highlightISCCheckbox.checked)
    Clip8controler.init(document.getElementById("clip8svgroot"), true, true, highlightISCCheckbox.checked );
}

function loadSVG(e2) {
    var svgraw = e2.target.result;
    var parseXml;
    if (typeof window.DOMParser != "undefined") {
        parseXml = function(xmlStr) {
            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        };
    } else {
        throw new Error("No XML parser found");
    }
    var svgdocument = parseXml(svgraw);
    var newsvgroot = svgdocument.rootElement;
    if (newsvgroot instanceof SVGSVGElement) {
        insertSVG(newsvgroot);
        lastloadedSVG = newsvgroot;
    } else {
        console.groupCollapsed("Could not load file content as SVG.");
        console.info("Content: ", svgraw);
        console.info("Document: ", svgdocument);
        console.groupEnd();
    }
}

function handleFileDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files; // Array of all files
    for (var i=0, file; file=files[i]; i++) {
        var reader = new FileReader();
        reader.onload = loadSVG;
        reader.readAsText(file); // start reading the file data.
    }
}

function handleFileChoice(e) {
    var files = e.target.files; // FileList object
    for (var i=0, file; file=files[i]; i++) {
        var reader = new FileReader();
        reader.onload = loadSVG;
        reader.readAsText(file); // start reading the file data.
    }
}

function handleStop() {
    if (lastloadedSVG) {
        insertSVG(lastloadedSVG);
    }
}

dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

dropZone.addEventListener('drop', handleFileDrop);
fileChooser.addEventListener('change', handleFileChoice, false);
