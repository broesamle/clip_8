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
        it("avoids invalid combinations to add up into any existing valid flag", function() {
            applyToAllFlags( function (key) {
                expect(DIRECTION.UP+DIRECTION.DOWN).not.toBe(DIRECTION[key]);
            });
            applyToAllFlags( function (key) {
                expect(DIRECTION.LEFT+DIRECTION.RIGH).not.toBe(DIRECTION[key]);
            });
        });
    });
});
