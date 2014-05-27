define(function(jio) {
  return function(actionByType, images, startGadget) {

    var canDo = function(elem, actions) {
      var meta = elem.parentNode.parentNode.getElementsByClassName('meta')[0];
      for (var action in actions) { (function(action) {
        if (!images[action] || (action === 'edit' && !XWiki.hasEdit)) { return; }
        var img = document.createElement('img');
        img.setAttribute('src', images[action]);
        var link = document.createElement('a');
        link.setAttribute('href', 'javascript:void(0)');
        link.appendChild(img);
        meta.parentNode.insertBefore(link, meta);
        Event.observe(link, 'click', function(e) {
          e.stop();
          var key  = {
            _id: XWiki.currentSpace + '/' + XWiki.currentPage,
            _attachment: unescape(elem.getAttribute('href').replace(/.*\//, '')),
          };
          require(['jio', 'xwikiJio'], function(jIO) {
            var jio = jIO.createJIO({ type: 'xwiki' });
            startGadget(
              actions[action],
              action,
              function(cb) {
                jio.getAttachment(key).always(function (ret) {
                  if (ret.status === 200) {
                    cb(undefined, ret.data);
                  } else {
                    cb(ret);
                  }
                });
              },
              function(data, cb) {
                key._data = data;
                jio.putAttachment(key).always(function (ret) {
                  if (ret.status === 204) {
                    cb(undefined);
                  } else {
                    cb(ret);
                  }
                });
              }
            );
          });
        });
      })(action);
      }
    };

    var keys = Object.keys(actionByType);
    var scanAttachments = function() {
      // avoid loading jquery per-page-load so use prototype.
      var list = $$('#Attachmentspane .information > .name > a');
      for (var i = 0; i < list.length; i++) {
        var index = keys.indexOf(list[i].getAttribute('href').replace(/.*\./g, ''));
        if (index === -1) { continue; }
        canDo(list[i], actionByType[keys[index]]);
      }
    };

    document.observe('xwiki:docextra:loaded', function(e) {
      if (e.memo.id === "Attachments") {
        scanAttachments();
      }
    });
    if (XWiki.isInitialized) {
      scanAttachments();
    } else {
      document.observe('xwiki:dom:loaded', function(e) {
        scanAttachments();
      });
    }
  }
});
