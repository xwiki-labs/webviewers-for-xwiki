var XWiki = require('xwiki-tools');

var doc = new XWiki.model.XWikiDoc(["Resilience","WebHome"]);
doc.setContent(
    XWiki.Tools.contentFromFile("src/xwiki/Resilience.WebHome.content.xwiki21")
);
doc.setTitle("Resilience Gadget Container");

var obj = new XWiki.model.JavaScriptExtension();
obj.setCode(XWiki.Tools.contentFromFile("./src/js/SkinExtension.js"));
doc.addXObject(obj);

doc.addAttachment("src/js/external/renderjs.js");
doc.addAttachment("src/js/external/jio.js");
doc.addAttachment("src/js/external/md5.js");


var pack = new XWiki.Package();
pack.setName("XWiki - Contrib - Resilience");
pack.setDescription("A container for platform independent web gadgets");
pack.setExtensionId("org.xwiki.contrib:xwiki-contrib-resilience");
pack.addDocument(doc);

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
