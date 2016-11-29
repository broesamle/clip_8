
var CLIP8_RUNNINGTIME = 500

var customMatchers = {
toBeElement:
    function (util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {
                var result = {};
                result.pass = (actual instanceof SVGElement) || (actual instanceof HTMLElement);
                result.message = "Expected " + actual + " to be instance of HTMLElement or SVGElement.";
                return result;
            }
        };
    },
toMatchReference:
    function (util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {
                var debug = false;
                var result = {};
                var cmpA = actual.outerHTML.replace(/\s+/gm, " ");
                var cmpB = expected.outerHTML.replace(/\s+/gm, " ")
                result.pass = cmpA==cmpB;
                if (debug) console.log("tests: ", cmpA, "==", cmpB, result.pass);
                result.message = "Expected " + actual + " to equal " + expected + ".";
                return result;
            }
        };
    }
};

var test_specids = [];
var test_domids = [];
var visualReporter = {
specDone: function(result) {
        var domid = test_domids.shift();
        var specid = test_specids.shift();
        var reportnode = document.createElement("span");
        if (result.status == "passed") {
            reportnode.appendChild(document.createTextNode("•"));
            reportnode.setAttribute("class", "DOMreftest-passed");
        }
        else if (result.status == "failed") {
            reportnode.appendChild(document.createTextNode("×"));
            reportnode.setAttribute("class", "DOMreftest-failed");
        }
        else { reportnode.appendChild(document.createTextNode("INTERNAL ERROR!")); }
        document.getElementById(domid).appendChild(reportnode);
    }
};

jasmine.getEnv().addReporter(visualReporter);

// fast, but depends on the order of test subelements!
function getPrecondition(reftestElement) { return reftestElement.firstElementChild; }
function getPostcondition(reftestElement) { return reftestElement.firstElementChild.nextElementSibling; }
function getTestDOM(reftestElement) { return reftestElement.firstElementChild.nextElementSibling.nextElementSibling; }

var GenericTestFns = {
    matchPre: function (reftestElement) {
        var pre = getPrecondition(reftestElement);
        var proc = getTestDOM(reftestElement);
        expect(pre.classList).toContain("pre-reference");
        expect(proc.classList).toContain("testDOM");
        expect(proc.firstElementChild).toBeElement();
        expect(pre.firstElementChild).toBeElement();
        expect(proc.firstElementChild).toMatchReference(pre.firstElementChild);
    },

    matchPost: function (reftestElement) {
        var proc = getTestDOM(reftestElement);
        var post = getPostcondition(reftestElement);
        expect(proc.classList).toContain("testDOM");
        expect(post.classList).toContain("post-reference");
        expect(proc.firstElementChild).toBeElement();
        expect(post.firstElementChild).toBeElement();
        expect(proc.firstElementChild).toMatchReference(post.firstElementChild);
    }
}

function addTest_normal_execution(reftestElement, cycles) {
    console.log("[TEST_NORMEXEC] cycles:", cycles );
    var spec;

    spec = it("["+reftestElement.id+"] PRE and TEST should be equal",
        function(done) {
        GenericTestFns.matchPre(reftestElement);
        done();
    });

    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] EXECUTE the operation without error", function(done) {
        var proc = getTestDOM(reftestElement);
        expect(proc.classList).toContain("testDOM");
        var svgroot = proc.firstElementChild;
        expect(svgroot).toBeElement();
        expect(svgroot.id).toBe("");
        svgroot.setAttributeNS(null,"id", "clip8svgroot");
        expect(svgroot.id).toBe("clip8svgroot");
        expect(Clip8.envokeOperation).not.toThrow();
        jasmine.clock().tick(CLIP8_RUNNINGTIME);
        expect(Clip8.executeOneOperation).toHaveBeenCalled();
        expect(Clip8.executeOneOperation.calls.count()).toEqual(cycles, "(instruction of cycles)");
        expect(Clip8.clearExecTimer).toHaveBeenCalled();
        svgroot.removeAttribute("id", reftestElement.id);
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] TEST and POST should be equal", function(done) {
        GenericTestFns.matchPost(reftestElement);
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);
}

function addTest_selectionset(reftestElement, p0x, p0y, color) {
    console.log("[TEST_SELECTIONSET] p0x, p0y, color:", p0x, p0y, color);
    var spec;

    spec = it("["+reftestElement.id+"] PRE and TEST should be equal",
        function(done) {
        GenericTestFns.matchPre(reftestElement);
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] EXECUTE the operation without error", function(done) {
        var proc = getTestDOM(reftestElement);
        expect(proc.classList).toContain("testDOM");
        var svgroot = proc.firstElementChild;
        expect(svgroot).toBeElement();
        var arearect = Svgdom.newRect(p0x-epsilon, p0y-epsilon, epsilon*2, epsilon*2);
        var selectionset = Clip8.handleSelectorAt(arearect, svgroot);
        for (var i = 0; i < selectionset.length; i++) {
            console.log("[addTest_selectionset] selectionset[i]:", selectionset[i]);
            if (selectionset[i] instanceof SVGElement)
                selectionset[i].setAttribute("fill", color);
        }
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] TEST and POST should be equal", function(done) {
        GenericTestFns.matchPost(reftestElement);
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);
}

describe("Reference Sheet Tester", function(){
    beforeEach(function() {
        jasmine.clock().install();
        jasmine.addMatchers(customMatchers);
        var oldroot = document.getElementById("clip8svgroot");
        if (oldroot) { oldroot.removeAttributeNS(null,"id"); }  // remove id from any leftover #clip8svgroot element
        spyOn(Clip8,"executeOneOperation").and.callThrough();
        spyOn(Clip8,"clearExecTimer").and.callThrough();
    });
    afterEach(function() {
        jasmine.clock().uninstall();
    });

    var  tests = document.getElementsByClassName("DOMreftest");
    for (var i = 0; i < tests.length; i++) {
        if (tests[i].classList[1] === "normal_execution") {
            cycles = parseInt(tests[i].classList[2]);
            addTest_normal_execution(tests[i], cycles);
        }
        else if (tests[i].classList[1] === "selectionset") {
            p0x = parseFloat(tests[i].classList[2].split(",")[0]);
            p0y = parseFloat(tests[i].classList[2].split(",")[1]);
            color = tests[i].classList[3];
            addTest_selectionset(tests[i], p0x, p0y, color);
        }
        else console.log("Found test without supported testtype.");
    }
});
