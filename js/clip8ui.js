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

"use strict";

var Clip8UI = {
    controls: undefined,
    // Control styling/visibility
    _hide_btn: function (btn) {
        btn.style.opacity = "0";
        btn.style.visibility = "hidden";
    },
    _unhide_btn: function (btn) {
        btn.style.opacity = "1";
        btn.style.visibility = "inherit";
    },

    fsm: new StateMachine({
        init: 'unready',
        transitions: [
            { name: 'getready',
              from: ['unready', 'terminated'],
              to: 'ready' },
            { name: 'play',
              from: ['ready', 'paused'], to: 'runningtimer' },
            { name: 'step',
              from: ['ready', 'paused'], to: 'paused' },
            { name: 'pause',
              from: ['running', 'runningtimer'], to: 'paused' },
            { name: 'terminate',
              from: ['running', 'runningtimer', 'paused'], to: 'terminated' },
            { name: 'timeout',
              from: ['runningtimer'], to: 'running' },
            { name: 'tap',
              from: ['running', 'runningtimer'],
              to: function() {
                    if (this.state == 'running') return 'runningtimer';
                    if (this.state == 'runningtimer') return 'running';
                    return '-- tap invalid --';     // will cause an error
                  } }
        ],
        data: {
            controls: undefined
        },
        methods: {
            onRunningtimer: function() {
                console.log("RUNNINGTIMER");
                this.timer = window.setTimeout(
                    function () { Clip8UI.fsm.timeout(); },
                    5000);
            },
            onLeaveRunningtimer: function () {
                console.log("   leaving RUNNINGTIMER");
                clearTimeout(this.timer);
            }
        }
    }),

    init: function(c8play=function(){},
                   c8pause=function(){},
                   c8step=function(){},
                   c8root,
                   controls) {
        console.groupCollapsed("Clip8UI.init");
        if (! controls) throw { error: 'Clip8UI.init: invalid controls',
                                controls: controls };
        Clip8UI.controls = controls;
        // event listeners: user interface events trigger transitions
        var buttons = controls.childNodes;
        for (var i = 0; i < buttons.length; i++) {
            var bt = buttons.item(i);
            switch (bt.id) {
                case "c8ui_play_btn":
                    // keep initial visibility setting
                    // use play button for all
                    // (it is visible at loading time)
                    bt.addEventListener('click',
                        function () { Clip8UI.fsm.play() });
                    console.log("now listening to", bt, "click");
                    Clip8UI.playbtn = bt;   // keep a reference
                    break;
                case "c8ui_pause_btn":
                    bt.addEventListener('click',
                        function () { Clip8UI.fsm.pause() });
                    console.log("now listening to", bt, "click");
                    Clip8UI.pausebtn = bt;   // keep a reference
                    break;
                case "c8ui_step_btn":
                    bt.addEventListener('click',
                        function () { Clip8UI.fsm.step() });
                    console.log("now listening to", bt, "click");
                    Clip8UI.stepbtn = bt;   // keep a reference
                    break;
                case "c8ui_reload_btn":
                    bt.addEventListener('click',
                        function () { Clip8UI.fsm.step() });
                    console.log("now listening to", bt, "click");
                    Clip8UI.reloadbtn = bt;   // keep a reference
                    break;
            }
        }
        Clip8UI.c8root = c8root;
        var tapfn = function () {
            if (Clip8UI.fsm.can('tap')) Clip8UI.fsm.tap();
        }
        c8root.addEventListener('click', tapfn);
        Clip8UI.fsm.observe({
            onGetready: function () {
                Clip8UI.controls.style.visibility = "visible";
                Clip8UI._hide_btn(Clip8UI.pausebtn);
                Clip8UI._hide_btn(Clip8UI.reloadbtn);
                Clip8UI._unhide_btn(Clip8UI.playbtn);
                Clip8UI._unhide_btn(Clip8UI.stepbtn);

            },
            onPlay: function () {
                Clip8UI._hide_btn(Clip8UI.playbtn);
                Clip8UI._unhide_btn(Clip8UI.pausebtn);
                Clip8UI._hide_btn(Clip8UI.stepbtn);
                Clip8UI._hide_btn(Clip8UI.reloadbtn);
                c8play();
            },
            onPause: function () {
                Clip8UI._hide_btn(Clip8UI.pausebtn);
                Clip8UI._unhide_btn(Clip8UI.playbtn);
                c8pause();
            },
            onStep: c8step,
            onRunning: function () {
                Clip8UI.controls.style.visibility = "hidden";
            },
            onRunningtimer: function () {
                Clip8UI.controls.style.visibility = "visible";
            },
            onPaused: function () {
                Clip8UI._unhide_btn(Clip8UI.reloadbtn);
                Clip8UI._unhide_btn(Clip8UI.stepbtn);
            },
            onTerminate: function () {
                console.debug("TERMINATE");
                Clip8UI.controls.style.visibility = "visible";
                Clip8UI._hide_btn(Clip8UI.pausebtn);
                Clip8UI._hide_btn(Clip8UI.playbtn);
                Clip8UI._hide_btn(Clip8UI.stepbtn);
                Clip8UI._unhide_btn(Clip8UI.reloadbtn);
            }
        });
        let position_el =
            document.querySelector("#c8config>#controls-position");
        if (position_el) {
            let x = parseFloat(position_el.getAttribute('cx'));
            let y = parseFloat(position_el.getAttribute('cy'));
            let [vx, vy, vw, vh] = Svgdom.getViewBox_asXYWH(c8root);
            console.debug("Positioning:", x, y, "vbox:", vx, vy, vw, vh);
            controls.style.left = String(100 * (x-vx) / vw ) + "%";
            controls.style.top = String(100 * (y-vy) / vh ) + "%";
        }
        else {
            console.log("no Position marker, using defaults.");
        }
        console.groupEnd();
    },
    getready: function () {
        console.debug("Clip8UI.getready");
        Clip8UI.fsm.getready();
    },
    terminate: function () {
        console.debug("Clip8UI.terminate");
        Clip8UI.fsm.terminate();
    }
};
