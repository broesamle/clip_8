
var test_specids = [];
var test_domids = [];

var visualReporter = {
specDone: function(result) {
        var domid = test_domids.shift();
        var specid = test_specids.shift();
        console.log("REPORT["+result.id+"]", "fetched ids:", test_specids.shift(), domid,' was ' + result.status);
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
    var spec;
    spec = it("["+reftestElement.id+"] PRE and TEST should be equal", function(done) {
        var pre = getPrecondition(reftestElement);
        var proc = getTestDOM(reftestElement);

        expect(pre.classList).toContain("pre-reference");
        expect(proc.classList).toContain("testDOM");
        expect(pre.firstElementChild.isEqualNode(proc.firstElementChild)).toBeTruthy();
        done();
    });
    console.log("addTest_invokeOperation: sepc:", spec.id, reftestElement.id);
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] EXECUTE the operation without error", function(done) {
        var proc = getTestDOM(reftestElement);
        expect(proc.classList).toContain("testDOM");
        var svgroot = proc.firstElementChild;
        var oldId = svgroot.id;
        svgroot.id = "clip8svgroot";
        expect(svgroot.id).toBe("clip8svgroot");
        clip8envokeOperation();
        svgroot.removeAttribute("id", reftestElement.id);
        done();
    });
    console.log("addTest_invokeOperation: sepc:", spec.id, reftestElement.id);
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);

    spec = it("["+reftestElement.id+"] TEST and POST should be equal", function(done) {
        var proc = getTestDOM(reftestElement);
        var post = getPostcondition(reftestElement);

        expect(proc.classList).toContain("testDOM");
        expect(post.classList).toContain("post-reference");
        expect(proc.firstElementChild.isEqualNode(post.firstElementChild)).toBeTruthy();
        done();
    });
    console.log("addTest_invokeOperation: sepc:", spec.id, reftestElement.id);
    test_specids.push(spec.id);
    test_domids.push(reftestElement.id);
}

describe("Reference Sheet Tester", function(){
    var  tests = document.getElementsByClassName("DOMreftest");
    for (var i = 0; i < tests.length; i++) {
        addTest_invokeOperation(tests[i]);
    }
});