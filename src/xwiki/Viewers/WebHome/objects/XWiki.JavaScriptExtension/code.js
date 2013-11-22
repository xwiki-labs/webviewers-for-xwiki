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
    rGadgets: "$xwiki.getURL('Viewers.Code', 'jsx')?",
    rHooks: "$xwiki.getDocument('Viewers.Code').getAttachmentURL('xwiki-rHooks.js')",
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

  require(['renderjs'], function() {
    rJS(window).ready(function() {
      var root = rJS(this);

      require(['rHooks', 'rGadgets'], function(hookProvider, gadgets) {
        hookProvider(function(hooks) {
          for (var i = 0; i < hooks.length; i++) {
            hooks[i](gadgets, {
              edit:'/xwiki/resources/icons/silk/pencil_add.png',
              view:'/xwiki/resources/icons/silk/magnifier.png'
            },
            function(gadgetPath, action, getData, putData) {
              require(['xwikiEditGadget'], function(xeg) {
                xeg.spawn(root, gadgetPath, action, getData, putData);
              });
            });
          }
        });
      });

      require(['xwikiInlineView', 'jquery'], function(xiv, $) {
        $('[data-gadget]').each(function(i, elem) {
          xiv.tryGadget(root, elem);
        });
      });

    });
  });
})();
