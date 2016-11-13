
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

function addTest_invokeOperation(reftestElement) {
    console.log("addTest_invokeOperation: ", reftestElement);
    var spec;

    spec = it("["+reftestElement.id+"] PRE and TEST should be equal", function(done) {
        var pre = getPrecondition(reftestElement);
        var proc = getTestDOM(reftestElement);
        expect(pre.classList).toContain("pre-reference");
        expect(proc.classList).toContain("testDOM");
        expect(proc.firstElementChild).toBeElement();
        expect(pre.firstElementChild).toBeElement();
        expect(proc.firstElementChild).toMatchReference(pre.firstElementChild);
        done();
    });

    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] EXECUTE the operation without error", function(done) {
        jasmine.clock().install();
        var proc = getTestDOM(reftestElement);
        expect(proc.classList).toContain("testDOM");
        var svgroot = proc.firstElementChild;
        expect(svgroot).toBeElement();
        expect(svgroot.id).toBe("");
        svgroot.setAttributeNS(null,"id", "clip8svgroot");
        expect(svgroot.id).toBe("clip8svgroot");
        expect(Clip8.envokeOperation).not.toThrow();
        jasmine.clock().tick(10000);
        expect(Clip8.executeOneOperation).toHaveBeenCalled();
        expect(Clip8.executeOneOperation.calls.count()).toBeLessThan(20);
        expect(Clip8.clearExecTimer).toHaveBeenCalled();
        svgroot.removeAttribute("id", reftestElement.id);
        jasmine.clock().uninstall();
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
        expect(proc.firstElementChild).toMatchReference(post.firstElementChild);
        done();
    });
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);
}

describe("Reference Sheet Tester", function(){
    beforeEach(function() {
        jasmine.addMatchers(customMatchers);
        var oldroot = document.getElementById("clip8svgroot");
        if (oldroot) { oldroot.removeAttributeNS(null,"id"); }  // remove id from any leftover #clip8svgroot element
        spyOn(Clip8,"executeOneOperation").and.callThrough();
        spyOn(Clip8,"clearExecTimer").and.callThrough();
    });

    var  tests = document.getElementsByClassName("DOMreftest");
    for (var i = 0; i < tests.length; i++) {
        addTest_invokeOperation(tests[i]);
    }
});