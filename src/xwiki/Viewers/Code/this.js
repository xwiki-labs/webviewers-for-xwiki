var Fs = require('fs');
var nThen = require('nthen');

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

nThen(function(waitFor) {
  Fs.readdir(dir, waitFor(function (err, names) {
      if (err) { throw err; }
      names.forEach(function(file) {
          Fs.readFile(dir + '/' + file, waitFor(function(err, ret) {
              if (err) { throw err; }
              hooks += ret;
          }));
      });
  }));

}).nThen(function(waitFor) {
  hooks += "  return function(cb) { complete = cb; if (!workers) { cb(array); } };\n";
  hooks += "});";
  var file = Os.tmpDir()+'/xwiki-rHooks.js';
  var done = function (err) {
      if (err) { throw err; }
      Fs.writeFile(file, hooks, function (err) {
          if (err) { throw err; }
          XWikiDoc(function (doc, XWiki) {
              doc.addAttachment(file);
          });
      });
  };
  Fs.exists(file, waitFor(function (exists) {
      if (exists) {
          Fs.unlink(file, done);
      } else {
          done();
      }
  }));
});
