;(function() {
  "use strict";
  var paths = {
      md5: "$doc.getAttachmentURL('md5.js')",
      jio: "$doc.getAttachmentURL('jio.js')",
      xJIO: "$doc.getAttachmentURL('xwikistorage.js')",
      renderjs: "$doc.getAttachmentURL('renderjs.js')",
  };
  for (var path in paths) { paths[path] = paths[path].replace(/\.js$/, ''); }
  require.config({
      paths: paths,
      shim: { jio: ["md5"] }
  });
  require(["renderjs"], function(RenderJs) {
      RenderJs.init();
  });
})();
