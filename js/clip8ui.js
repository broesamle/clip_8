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
    fsm: new StateMachine({
        init: 'ready',
        transitions: [
            { name: 'play',
              from: ['ready', 'paused'], to: 'justrunning' },
            { name: 'afterdelay',
              from: ['justrunning'], to: 'running' },
            { name: 'tap',
              from: ['running'], to: 'justrunning' }
        ],
        data: {
            controls: undefined
        },
        methods: {
            onInit: function() {
                console.log("onInit handler method");
            },
            onRunning: function() {
                console.log("onRunning handler method");
            },
            onJustrunning: function() {
                console.log("onJustrunning handler method");
                window.setTimeout(
                    function () { Clip8UI.fsm.afterdelay(); },
                    1000);
            }
        }
    }),

    init: function(c8play=function(){},
                   c8pause=function(){},
                   c8step=function(){},
                   controls) {
        console.groupCollapsed("Clip8UI.init");
        if (! controls) throw { error: 'Clip8UI.init: invalid controls',
                                controls: controls };
        Clip8UI.controls = controls;
        var buttons = controls.childNodes;
        for (var i = 0; i < buttons.length; i++) {
            var bt = buttons.item(i);
            switch (bt.id) {
                case "c8ui_play_btn":
                    bt.addEventListener('click',
                        function () { Clip8UI.fsm.play() });
                    console.log("now listening to", bt, "click");
                    break;
            }
        }
        Clip8UI.fsm.observe({
            onPlay: c8play,
            onRunning: function () {
                Clip8UI.controls.style.visibility = "hidden";
            },
            onJustrunning: function () {
                Clip8UI.controls.style.visibility = "visible";
            }
        });
        console.groupEnd();
    }
};
