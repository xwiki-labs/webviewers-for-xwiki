var XWiki = require('../../xwiki-tools/index');
var nThen = require('nthen');

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

    var obj = new XWiki.model.JavaScriptExtension();
    obj.setCode(XWiki.Tools.contentFromFile(dir + "objects/XWiki.JavaScriptExtension/code.js"));
    doc.addXObject(obj);

    // {{edit tar="hello.txt"/}}
    obj = new XWiki.model.WikiMacroClass();
    obj.setCode(XWiki.Tools.contentFromFile(dir + "objects/XWiki.WikiMacroClass/code.xwiki21"));
    obj.setDefaultCategory("resilience");
    obj.setId("edit");
    obj.setName("edit");
    doc.addXObject(obj);

    obj = new XWiki.model.WikiMacroParameterClass();
    obj.setName("tar");
    obj.setMandatory(1);
    doc.addXObject(obj);

    doc.addAttachment(dir + "attachments/renderjs.js");
    doc.addAttachment(dir + "attachments/jio.js");
    doc.addAttachment(dir + "attachments/md5.js");
    doc.addAttachment(dir + "attachments/xwikistorage.js");
    pack.addDocument(doc);
})();


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
    var BuildGadget = require('./buildgadget');
    var Fs = require('fs');

    Fs.readdirSync('./' + gd).forEach(function(file) {
        BuildGadget(gd + '/' + file, waitFor(function(zipFile) {
            doc.addAttachment(zipFile);
        }));
    });

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
