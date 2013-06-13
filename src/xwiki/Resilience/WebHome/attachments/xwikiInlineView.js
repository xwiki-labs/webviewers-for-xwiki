define(['jquery', 'typeconverter'], function($, Converter) {
  var defaultHelp = function(gadgetName) {
    return "No help is available for gadget [" + gadgetName + "]";
  };

  return {
    tryGadget: function(gadgetElement) {
      var elem = $(gadgetElement)

      if (!elem.attr('data-gadget').match(/\.js$/)) { return false; }

      var props = JSON.parse(unescape(elem.attr('data-gadget-property')));
      elem.removeAttr('data-gadget');
      elem.removeAttr('data-gadget-property');

      elem.append('<div></div>');
      var innerDiv = $(elem.children()[0]);

      var getGetData = function(jio, jioAttach) {
        return function(cb) {
          jio.getAttachment(jioAttach, cb);
        };
      };
      var getPutData = function(jio, jioAttach) {
        return function(dat, cb) {
          var att = { _id:jioAttach._id, _attachment:jioAttach._attachment };
          att._data = dat;
          jio.putAttachment(att, cb);
        };
      };

      if (props.actions.edit) {
        require(['xwikiEditGadget', 'jio'], function(xeg, jio) {
          xeg.injectEditButton(gadgetElement,
                               props.actions,
                               getGetData(jio, props.jioAttach),
                               getPutData(jio, props.jioAttach));
        });
      }

      // setup the height/width.
      props.height = props.height || "60%";
      props.width = props.width || "80%";
      if (props.height.match(/%$/)) {
        // fix up percent params which should be percent of the visible space.
        var percent = new Number(props.height.replace('%', ''));
        props.height = Math.floor($(window).height() * (percent/100)) + "px"
      }

      // strip leading / and trailing .js
      var gadgetPath = props.actions.view.replace(/^\/|\.js$/g, '');
      require([gadgetPath, 'jio'], function(gadget, jio) {
        innerDiv.css({ width:props.width, height:props.height });
        gadget(function(type, cb) {
          Converter.convert(getGetData(jio, props.jioAttach), type, cb);
        }, innerDiv, 'view', props.moreParams);
      });

      return true;
    },
  };
});
