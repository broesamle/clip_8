
var CLIP8_RUNNINGTIME = 500

// For normal test runs, the test sheet specifies an expected number of `cycles`
// The test allows the clip8 interpreter to run for `cycles + EXCESS_CYCLES`.
var EXCESS_CYCLES = 100

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
                result.message = "Expected " + cmpA + " to equal " + cmpB + ".";
                return result;
            }
        };
    },

_toStringSortAttrs: function (el) {
    var result = "";
    for (var i = 0; i < el.childNodes.length; i++) {
        if ((el.childNodes[i] instanceof SVGElement) || (el.childNodes[i] instanceof HTMLElement)) {
            result += el.childNodes[i].tagName + ": ";
            var attribsAsStrings = [];
            for (var j = 0; j < el.childNodes[i].attributes.length ; j++)
                attribsAsStrings.push( el.childNodes[i].attributes[j].name + "=" + el.childNodes[i].attributes[j].value );
            attribsAsStrings.sort();
            result += attribsAsStrings.toString() + "; ";
        }
    }
    return result;
},

attributesOfChildrenToMatch:
    function (util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {
                var result = {};
                var debug = false;
                var actualCmp = customMatchers._toStringSortAttrs(actual);
                var expectedCmp = customMatchers._toStringSortAttrs(expected);
                result.pass = actualCmp==expectedCmp;
                if (debug) console.log("tests: ", actualCmp, "==", expectedCmp, result.pass);
                result.message = "Expected " + actualCmp + " to equal " + expectedCmp + ".";
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
function getTestSVG(reftestElement) { return reftestElement.firstElementChild.nextElementSibling.nextElementSibling.firstElementChild }

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
        expect(
            function () {
                Clip8controler.init(svgroot, visualise=false);
                Clip8controler.testRun(cycles+EXCESS_CYCLES);
            }).not.toThrow();
        jasmine.clock().tick(CLIP8_RUNNINGTIME);
        expect(Clip8.executeOneOperation).toHaveBeenCalled();
        expect(Clip8.executeOneOperation.calls.count()).toEqual(cycles, "(instruction of cycles)");
        expect(Clip8.stopTimer).toHaveBeenCalled();
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
        var pre = getPrecondition(reftestElement);
        var proc = getTestDOM(reftestElement);
        expect(pre.classList).toContain("pre-reference");
        expect(proc.classList).toContain("testDOM");
        expect(proc.firstElementChild).toBeElement();
        expect(pre.firstElementChild).toBeElement();
        expect(proc.firstElementChild).attributesOfChildrenToMatch(pre.firstElementChild);
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] EXECUTE the operation without error", function(done) {
        var proc = getTestDOM(reftestElement);
        expect(proc.classList).toContain("testDOM");
        var svgroot = proc.firstElementChild;
        expect(svgroot).toBeElement();
        Svgdom.init(svgroot);
        Svgretrieve.init(svgroot);
        var p0 = svgroot.createSVGPoint();
        p0.x = p0x;
        p0.y = p0y;
        Clip8.blocklist = [];   // reset the blocklist; we are fetching a new instruction
        var S0 = Clip8.retrieveISCElements(p0, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS)[1];
        var retrselector = Clip8.retrieveCoreSelector(S0, p0)
        var selectortype = retrselector[0];
        var coreselector = retrselector[1];
        var selectionset = Clip8.selectedElementSet(coreselector, svgroot);
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
        var proc = getTestDOM(reftestElement);
        var post = getPostcondition(reftestElement);
        expect(proc.classList).toContain("testDOM");
        expect(post.classList).toContain("post-reference");
        expect(proc.firstElementChild).toBeElement();
        expect(post.firstElementChild).toBeElement();
        expect(proc.firstElementChild).attributesOfChildrenToMatch(post.firstElementChild);
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);
}

function addTest_element_ISCDdetection (reftestElement, expectedDetection) {
    console.log("[TEST_ELEMENT-ISC-DETECTION] expectedDetection:", expectedDetection, reftestElement);
    var spec;
    var htmlstring = "";
    var elementtester = function (el) {
        var htmlstring = el.outerHTML.replace(/\s+/gm, " ");
        return it("Should be "+expectedDetection+" : "+htmlstring, function(done) {
            expect ( ISCD.legibleStr(ISCD.detect(el)) ).toBe(expectedDetection);
            done();
        });
    }

    for (var el=getTestSVG(reftestElement).firstElementChild; el; el=el.nextElementSibling) {
        spec = elementtester(el);
        test_specids.push(spec.id);
        test_domids.push(reftestElement.id);
    }
}

describe("Reference Sheet Tester", function(){
    beforeEach(function() {
        jasmine.clock().install();
        jasmine.addMatchers(customMatchers);
        var oldroot = document.getElementById("clip8svgroot");
        if (oldroot) { oldroot.removeAttributeNS(null,"id"); }  // remove id from any leftover #clip8svgroot element
        spyOn(Clip8,"executeOneOperation").and.callThrough();
        spyOn(Clip8,"stopTimer").and.callThrough();
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
        else if (tests[i].classList[1] === "element_ISCDdetection") {
            addTest_element_ISCDdetection(tests[i], tests[i].classList[2]);
        }
        else console.log("Found test without supported testtype.");
    }
});
