;(function() {
  "use strict";
  var paths = {
    md5: "$doc.getAttachmentURL('md5.js')",
    jiobase: "$doc.getAttachmentURL('jio.js')",
    jio: "$doc.getAttachmentURL('xwikistorage.js')",
    renderjs: "$doc.getAttachmentURL('renderjs.js')",
    typeconverter: "$doc.getAttachmentURL('typeconverter.js')",
    simplemodal: "$doc.getAttachmentURL('simplemodal.js')",
    simplemodal_osx: "$doc.getAttachmentURL('simplemodal_osx.js')",
    xwikiEditGadget: "$doc.getAttachmentURL('xwikiEditGadget.js')",
    xwikiInlineView: "$doc.getAttachmentURL('xwikiInlineView.js')",
    // the ? is needed to keep require.js from adding a .js to the end.
    rGadgets: "$xwiki.getURL('Resilience.Code', 'jsx')?",
    rHooks: "$xwiki.getDocument('Resilience.Code').getAttachmentURL('xwiki-rHooks.js')",
  };
  for (var path in paths) { paths[path] = paths[path].replace(/\.js$/, ''); }
  require.config({
    config: {
      jio: { useBlobs: true },
    },
    paths: paths,
    shim: {
      jiobase: ["md5"]
    }
  });

  require(['rHooks', 'rGadgets'], function(hookProvider, gadgets) {
    hookProvider(function(hooks) {
      for (var i = 0; i < hooks.length; i++) {
        hooks[i](gadgets, {
          edit:'/xwiki/resources/icons/silk/pencil_add.png',
          view:'/xwiki/resources/icons/silk/magnifier.png'
        },
        function(gadgetPath, action, getData, putData) {
          require(['xwikiEditGadget'], function(xeg) {
            xeg.spawn(gadgetPath, action, getData, putData);
          });
        });
      }
    });
  });

  var elems = document.getElementsByClassName('gadget');
  // fast path, no elements
  if (elems.length === 0) { return; }
  require(['xwikiInlineView'], function(xwikiInlineView) {
    var rjsElements = elems.length;
    for (var i = 0; i < elems.length; i++) {
      if (xwikiInlineView.tryGadget(elems[i]) && i == elems.length-1) {
        rjsElements--;
      }
    }
    if (rjsElements > 0) {
      require(["renderjs"], function(RenderJs) {
          RenderJs.init();
      });
    }
  });
})();
