describe("Clip8decode", function() {
    var svgroot;
    beforeEach(function(done) {
        svgroot = document.getElementById("svgroot1");
        while (svgroot.firstChild) {
            svgroot.removeChild(svgroot.firstChild);
        }
        svgroot.setAttribute("width", 100);
        svgroot.setAttribute("height", 100);
        svgroot.setAttribute("viewBox", "0 0 100 100");
        done();
    });
    describe("DIRECTION indicator flags", function() {
        it("NONE is falsy", function() {
             expect(DIRECTION.NONE).toBeFalsy();
             if (DIRECTION.NONE) fail("if (DIRECTION.NONE) { this should not execute }");
        });
        it("UP is truthy", function() {
             expect(DIRECTION.UP).toBeTruthy();
             if (!DIRECTION.UP) fail("if (!DIRECTION.UP) { this should not execute }");
        });
        it("DOWN is truthy", function() {
             expect(DIRECTION.DOWN).toBeTruthy();
             if (!DIRECTION.DOWN) fail("if (!DIRECTION.DOWN) { this should not execute }");
        });
        it("RIGHT is truthy", function() {
             expect(DIRECTION.RIGHT).toBeTruthy();
             if (!DIRECTION.RIGHT) fail("if (!DIRECTION.RIGHT) { this should not execute }");
        });
        it("LEFT is truthy", function() {
             expect(DIRECTION.LEFT).toBeTruthy();
             if (!DIRECTION.LEFT) fail("if (!DIRECTION.LEFT) { this should not execute }");
        });
        it("can be combined by addition in a meaningful way", function() {
            expect(DIRECTION.UP+DIRECTION.RIGHT).toBe(DIRECTION.UP_RIGHT);
            expect(DIRECTION.UP+DIRECTION.LEFT).toBe(DIRECTION.UP_LEFT);
            expect(DIRECTION.DOWN+DIRECTION.RIGHT).toBe(DIRECTION.DOWN_RIGHT);
            expect(DIRECTION.DOWN+DIRECTION.LEFT).toBe(DIRECTION.DOWN_LEFT);
        });
        var applyToAllFlags = function(fn) {
            Object.keys(DIRECTION).forEach(function(key,index) {
                fn(key);
            });
        };
        it("prevent the invalid combinations UP+DOWN and LEFT+RIGHT to result in any valid flag", function() {
            applyToAllFlags( function (key) {
                expect(DIRECTION.UP+DIRECTION.DOWN).not.toBe(DIRECTION[key]);
            });
            applyToAllFlags( function (key) {
                expect(DIRECTION.LEFT+DIRECTION.RIGHT).not.toBe(DIRECTION[key]);
            });
        });
    });

    describe("getAxisAlignedXYLegs", function() {
        var expectLegsToBe_perm = function (O, pX, pY, targetX, targetY) {
            var result;
            result = Clip8decode.getAxisAlignedXYLegs([O, pX, pY]);
            expect(result.x_leg).toBe(targetX);
            expect(result.y_leg).toBe(targetY);
            expect(result.origin.x).toBe(O.x);
            expect(result.origin.y).toBe(O.y);
            result = Clip8decode.getAxisAlignedXYLegs([O, pY, pX]);
            expect(result.x_leg).toBe(targetX);
            expect(result.y_leg).toBe(targetY);
            expect(result.origin.x).toBe(O.x);
            expect(result.origin.y).toBe(O.y);
            result = Clip8decode.getAxisAlignedXYLegs([pX, O, pY]);
            expect(result.x_leg).toBe(targetX);
            expect(result.y_leg).toBe(targetY);
            expect(result.origin.x).toBe(O.x);
            expect(result.origin.y).toBe(O.y);
            result = Clip8decode.getAxisAlignedXYLegs([pX, pY, O]);
            expect(result.x_leg).toBe(targetX);
            expect(result.y_leg).toBe(targetY);
            expect(result.origin.x).toBe(O.x);
            expect(result.origin.y).toBe(O.y);
            result = Clip8decode.getAxisAlignedXYLegs([pY, O, pX]);
            expect(result.x_leg).toBe(targetX);
            expect(result.y_leg).toBe(targetY);
            expect(result.origin.x).toBe(O.x);
            expect(result.origin.y).toBe(O.y);
            result = Clip8decode.getAxisAlignedXYLegs([pY, pX, O]);
            expect(result.x_leg).toBe(targetX);
            expect(result.y_leg).toBe(targetY);
            expect(result.origin.x).toBe(O.x);
            expect(result.origin.y).toBe(O.y);
        }
        describe("when both legs point along x and y axes (O.x < pX.x) and (O.y < pY.y)", function () {
            var dx = 25, dy = 13;
            var O  = { x: 39   , y: 33    };
            var pX = { x: 39+dx, y: 33    };
            var pY = { x: 39   , y: 33+dy };
            it("returns positive distance in x and y direction", function() {
                expectLegsToBe_perm(O, pX, pY, dx, dy);
            });
        });
        describe("when the x leg points along and the y leg against its axis (O.x < pX.x) and (O.y > pY.y)", function () {
            var dx = 25, dy = -13;
            var O  = { x: 39   , y: 33    };
            var pX = { x: 39+dx, y: 33    };
            var pY = { x: 39   , y: 33+dy };
            it("returns positive x and negative y direction", function() {
                expectLegsToBe_perm(O, pX, pY, dx, dy);
            });
        });
        describe("when the y leg points along and the x leg against its axis (O.x > pX.x) and (O.y < pY.y)", function () {
            var dx = -25, dy = 13;
            var O  = { x: 39   , y: 33    };
            var pX = { x: 39+dx, y: 33    };
            var pY = { x: 39   , y: 33+dy };
            it("returns positive y and negative x direction", function() {
                expectLegsToBe_perm(O, pX, pY, dx, dy);
            });
        });
        describe("when both legs point against their axes (O.x > pX.x) and (O.y > pY.y)", function () {
            var dx = -25, dy = -13;
            var O  = { x: 39   , y: 33    };
            var pX = { x: 39+dx, y: 33    };
            var pY = { x: 39   , y: 33+dy };
            it("returns negative x and y direction", function() {
                expectLegsToBe_perm(O, pX, pY, dx, dy);
            });
        });
    });
});
