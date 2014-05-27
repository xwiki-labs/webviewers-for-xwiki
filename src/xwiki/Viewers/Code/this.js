var Fs = require('fs');
var nThen = require('nthen');
var Os = require('os');

var DIR = "src/hooks/";
var hooks = [
  "define(function() {",
  "  var array = [];",
  "  var complete;",
  "  var workers = 0;",
  "  var done = function() { if (!workers) { return; } if (--workers) { return; } complete(array); };",
  "  var define = function(r, f) {",
  "    if (typeof(r) === 'function') {",
  "      array.push(r());",
  "    } else {",
  "      workers++;",
  "      require(r, function() {",
  "        array.push(f.apply(this, Array.prototype.slice.call(arguments)));",
  "        done();",
  "      });",
  "    }",
  "  };"
].join('\n');


nThen(function(waitFor) {
  Fs.readdir(DIR, waitFor(function (err, names) {
      if (err) { throw err; }
      names.forEach(function(file) {
          Fs.readFile(DIR + '/' + file, waitFor(function(err, ret) {
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
