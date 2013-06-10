;(function() {
  "use strict";
  var paths = {
      md5: "$doc.getAttachmentURL('md5.js')",
      jiobase: "$doc.getAttachmentURL('jio.js')",
      jio: "$doc.getAttachmentURL('xwikistorage.js')",
      renderjs: "$doc.getAttachmentURL('renderjs.js')",
  };
  for (var path in paths) { paths[path] = paths[path].replace(/\.js$/, ''); }
  require.config({
      config: {
          jio: { useBlobs: true },
      },
      paths: paths,
      shim: { jiobase: ["md5"] }
  });
  require(["renderjs"], function(RenderJs) {
      RenderJs.init();
  });
})();
