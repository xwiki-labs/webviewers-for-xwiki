var XWiki = require('../../xwiki-tools/index');
var nThen = require('nthen');
var BuildGadget = require('./buildgadget');
var Fs = require('fs');

//---------------------- Create XWiki Package ----------------------//

var pack = new XWiki.Package();
pack.setName("XWiki - Contrib - Resilience");
pack.setDescription("A container for platform independent web gadgets");
pack.setExtensionId("org.xwiki.contrib:xwiki-contrib-resilience");


//---------------------- Resilience.WebHome ----------------------//
;(function() {
    var dir = "src/xwiki/Resilience/WebHome/";
    var doc = new XWiki.model.XWikiDoc(["Resilience","WebHome"]);
    doc.setTitle("Resilience Gadget Loader");

    var obj = new XWiki.model.classes.JavaScriptExtension();
    obj.setCode(XWiki.Tools.contentFromFile(dir + "objects/XWiki.JavaScriptExtension/code.js"));
    obj.setParse(true);
    obj.setUse('always');
    doc.addXObject(obj);

    doc.addAttachment(dir + "attachments/renderjs.js");
    doc.addAttachment(dir + "attachments/jio.js");
    doc.addAttachment(dir + "attachments/md5.js");
    doc.addAttachment(dir + "attachments/xwikistorage.js");
    pack.addDocument(doc);
})();

// {{edit tar="hello.txt" /}}
// {{view tar="hello.txt" /}}
var dir = "src/action-macros/";
Fs.readdirSync(dir).forEach(function(file) {
    var act = file.replace(/.*\/|\..*/, '');

    var doc =
        new XWiki.model.XWikiDoc(["Resilience", act[0].toUpperCase()+act.substring(1)+"Macro"]);
    doc.setTitle("Resilience " + act + " macro");

    var obj = new XWiki.model.classes.WikiMacroClass();
    obj.setCode(XWiki.Tools.contentFromFile(dir+file));
    obj.setDefaultCategory("resilience");
    obj.setId(act);
    obj.setName(act);
    doc.addXObject(obj);

    var WikiMacroParameterClass = XWiki.model.classes.WikiMacroParameterClass;
    doc.addXObject(new WikiMacroParameterClass().setName("tar").setMandatory(true));
    doc.addXObject(new WikiMacroParameterClass().setName("as").setMandatory(false));

    pack.addDocument(doc);
});


//---------------------- Resilience.Demo ----------------------//
;(function() {
    var dir = "src/xwiki/Resilience/Demo/";
    var doc = new XWiki.model.XWikiDoc(["Resilience","Demo"]);
    doc.setContent(XWiki.Tools.contentFromFile(dir + "content.xwiki21"));
    doc.setTitle("Resilience Loader Demo");
    doc.addAttachment(dir + "attachments/hello.txt");
    pack.addDocument(doc);
})();


//---------------------- Build Gadgets ----------------------//
nThen(function(waitFor) {

    var doc = new XWiki.model.XWikiDoc(["Resilience","Gadgets"]);
    doc.setTitle("Resilience Gadget Container");

    var gd = 'src/gadgets';
    console.log(process.cwd());

    var files = Fs.readdirSync('./' + gd);
    var f = function() {
        if (files.length > 0) {
            BuildGadget(gd + '/' + files.pop(), waitFor(function(zipFile) {
                doc.addAttachment(zipFile);
                f();
            }));
        }
    };
    f();

    pack.addDocument(doc);


//---------------------- Resilience.MacroCode ----------------------//
}).nThen(function(waitFor) {

    doc = new XWiki.model.XWikiDoc(["Resilience","Code"]);
    doc.setContent(XWiki.Tools.contentFromFile("src/xwiki/Resilience/Code/content.groovy"));
    pack.addDocument(doc);


//---------------------- Package it up ----------------------//

    // Post to a wiki?
    // must post to a /preview/ page, for example:
    // syntax  ./do --post Admin:admin@192.168.1.1:8080/xwiki/bin/preview//
    var i;
    if ((i = process.argv.indexOf('--post')) > -1) {
        pack.postToWiki(process.argv[i+1]);

    } else if ((i = process.argv.indexOf('--mvn')) > -1) {
        pack.genMvn('mvnout');

    } else {
        pack.genXar('XWiki.Resilience.xar');
    }

});
