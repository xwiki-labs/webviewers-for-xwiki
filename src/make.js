var XWiki = require('xwiki-tools');
var nThen = require('nthen');
var BuildGadget = require('./buildgadget');
var Fs = require('fs');
var Os = require('os');

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
    obj.setCache('long');
    doc.addXObject(obj);

    Fs.readdirSync(dir + "attachments").forEach(function(name) {
        doc.addAttachment(dir + "attachments/" + name);
    });

    pack.addDocument(doc);
})();

// {{embed tar="hello.abc" as="txt" width="100%" height="100%" params="help" /}}
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
    doc.addXObject(new WikiMacroParameterClass().setName("height").setMandatory(false));
    doc.addXObject(new WikiMacroParameterClass().setName("width").setMandatory(false));
    doc.addXObject(new WikiMacroParameterClass().setName("params").setMandatory(false));

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


//---------------------- Resilience.Code ----------------------//
}).nThen(function(waitFor) {
    var dir = "src/xwiki/Resilience/Code";
    doc = new XWiki.model.XWikiDoc(["Resilience","Code"]);
    doc.setContent(XWiki.Tools.contentFromFile(dir+"/content.groovy"));

    // also include code for getting the list of working actions.
    var obj = new XWiki.model.classes.JavaScriptExtension();
    obj.setCode(XWiki.Tools.contentFromFile(dir + "/objects/XWiki.JavaScriptExtension/code.js"));
    obj.setParse(true);
    obj.setUse('demand');
    obj.setCache('forbid');
    doc.addXObject(obj);

    // hooks
    dir = "src/hooks/";
    var hooks = '';
    hooks += "define(function() {\n";
    hooks += "  var array = [];\n";
    hooks += "  var complete;\n";
    hooks += "  var workers = 0;\n";
    hooks += "  var done = function() { if (!workers) { return; } if (--workers) { return; } complete(array); };\n";
    hooks += "  var define = function(r, f) {\n";
    hooks += "    if (typeof(r) === 'function') {\n";
    hooks += "      array.push(r());\n";
    hooks += "    } else {\n";
    hooks += "      workers++;\n";
    hooks += "      require(r, function() {\n";
    hooks += "        array.push(f.apply(this, Array.prototype.slice.call(arguments)));\n";
    hooks += "        done();\n";
    hooks += "      });\n";
    hooks += "    }\n";
    hooks += "  };\n";
    nThen(function(wf) {
      Fs.readdirSync(dir).forEach(function(file) {
        Fs.readFile(dir + '/' + file, wf(function(err, ret) {
          if (err) { throw err; }
          hooks += ret;
        }));
      });
    }).nThen(waitFor(function(wf) {
      hooks += "  return function(cb) { complete = cb; if (!workers) { cb(array); } };\n";
      hooks += "});";
      var file = Os.tmpDir()+'/xwiki-rHooks.js';
      if (Fs.existsSync(file)) {
          Fs.unlinkSync(file);
      }
      Fs.writeFileSync(file, hooks);
      doc.addAttachment(file);

      pack.addDocument(doc);      
    }));

}).nThen(function(waitFor) {

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
