define(['jquery', 'typeconverter', 'jio', 'xwikiJio'], function($, Converter, jIO) {
  var defaultHelp = function(gadgetName) {
    return "No help is available for gadget [" + gadgetName + "]";
  };

  var jio = jIO.createJIO({ type: 'xwiki' });

  return {
    tryGadget: function(root, gadgetElement) {
      var elem = $(gadgetElement)

      if (!elem.attr('data-gadget').match(/\.html$/)) { return false; }

      var props = JSON.parse(unescape(elem.attr('data-gadget-property')));
      //elem.removeAttr('data-gadget');
      //elem.removeAttr('data-gadget-property');

      props.height = props.height || "60%";
      props.width = props.width || "80%";
      if (props.height.match(/%$/)) {
        // fix up percent params which should be percent of the visible space.
        var percent = new Number(props.height.replace('%', ''));
        props.height = Math.floor($(window).height() * (percent/100)) + "px";
      }
      $(elem).css({width:props.width, height:props.height});

      var getGetData = function (jio, jioAttach) {
        return function(cb) {
          jio.getAttachment(jioAttach).always(function (ret) {
            if (ret.status !== 200) {
              cb(ret);
            } else {
              cb(undefined, ret.data);
            }
          });
        };
      };
      var getPutData = function (jio, jioAttach) {
        return function(dat, cb) {
          var att = { _id:jioAttach._id, _attachment:jioAttach._attachment };
          att._data = dat;
          jio.putAttachment(att).always(function (ret) {
            if (ret.status === 204) {
              cb();
            } else {
              cb(JSON.stringify(ret, null, '  '));
            }
          });
        };
      };

      window.jQuery = $;

      if (props.actions.edit && XWiki.hasEdit) {
        require(['xwikiEditGadget'], function(xeg) {
          xeg.injectEditButton(root,
                               gadgetElement,
                               props.actions,
                               getGetData(jio, props.jioAttach),
                               getPutData(jio, props.jioAttach));
        });
      }

      var innerDiv = $('<div style="width:100%;height:100%;"></div>');
      $(elem).append(innerDiv);
      root.declareIframedGadget(decodeURI($(elem).attr('data-gadget')), $(innerDiv)).done(
        function(gadget) {
          var ifrDoc = $(elem).find('iframe')[0].contentWindow.document;
          var href = $(ifrDoc).find('[rel="http://www.renderjs.org/rel/interface"]').attr('href');
          var type = '';
          if (href === 'http://www.renderjs.org/interface/blob-editor') {
            type = 'blob';
          } else if (href === 'http://www.renderjs.org/interface/text-editor') {
            type = 'text';
          } else {
            throw new Error('unknown interface type [' + href + ']');
          }

          Converter.convert(getGetData(jio, props.jioAttach), type, function (err, ret) {
            if (err) { throw err; }
            if (type === 'blob') { ret = URL.createObjectURL(ret); }
            gadget.setContent(ret);
          });
        }
      );

      return true;
    },
  };
});
