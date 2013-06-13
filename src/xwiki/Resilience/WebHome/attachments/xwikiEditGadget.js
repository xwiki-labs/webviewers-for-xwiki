define(['jquery', 'simplemodal_osx', 'typeconverter'], function($, SimpleModalOSX, Converter) {

  $($('head')[0]).append([
    '<style>'
    ,'#osx-modal-content, #osx-modal-data {display:none;}'

    /* Overlay */
    ,'#osx-overlay {background-color:#000;}'

    /* Container */
    ,'#osx-container {background-color:#eee; color:#000;'
    ,  'font: 16px/24px "Lucida Grande",Arial,sans-serif;'
    ,  'padding-bottom:4px; -moz-border-radius-bottomleft:6px;'
    ,  '-webkit-border-bottom-left-radius:6px; -moz-border-radius-bottomright:6px;'
    ,  '-webkit-border-bottom-right-radius:6px; border-radius:0 0 6px 6px;'
    ,  '-moz-box-shadow:0 0 64px #000; -webkit-box-shadow:0 0 64px #000;'
    ,  'box-shadow:0 0 64px #000;'
    ,  'width:85%;'
    ,'}'
    ,'#osx-container a {color:#ddd;}'
    ,'#osx-container #osx-modal-title {'
    ,  'color:#000; background-color:#ddd;'
    ,  'border-bottom:1px solid #ccc; font-weight:bold; padding:6px 8px;'
    ,  'text-shadow:0 1px 0 #f4f4f4;'
    ,'}'
    ,'#osx-container .close {display:none; position:absolute; right:0; top:0;}'
    ,'#osx-container .close a {'
    ,  'display:block; color:#777; font-weight:bold; padding:6px 12px 0;'
    ,  'text-decoration:none; text-shadow:0 1px 0 #f4f4f4;'
    ,'}'
    ,'#osx-container .close a:hover {color:#000;}'
    ,'#osx-container #osx-modal-data {font-size:12px; padding:6px 12px;}'
    ,'#osx-container h2 {margin:10px 0 6px;}'
    ,'#osx-container p {margin-bottom:10px;}'
    ,'#osx-container span {color:#777;}'
    ,'</style>'
  ].join('\n'));

  $('#body').append([
    '<div id="osx-modal-content">'
    ,'<div id="osx-modal-title"></div>'
    ,'<div class="close"><a href="#" class="simplemodal-close">x</a></div>'
    ,'<div id="osx-modal-data">'
    ,'<div></div>'
    ,'<div></div>'
    ,'</div>'
		,'</div>'].join(''));

  var addButton = function(domLocation, keyCombo, name) {
    var id = 'id-' + String(Math.random()).replace(/0\./, '');
    $(domLocation).append('<span class="buttonwrapper">' +
      '<input class="button" type="submit" id="' + id + '"></input></span>');
    var ret = $('#' + id);
    ret.attr('title', keyCombo);
    ret.attr('value', name);
    return ret
  };

  var modalData = $('#osx-modal-data');
  var targetDiv = modalData.children()[0];
  var buttonDiv = modalData.children()[1];
  
  $(targetDiv).css({
    height: Math.floor($(window).height() * 0.82) + "px",
    width: Math.floor($(window).width() * 0.82) + "px"
  })
  //var preview = addButton(modalData, 'Alt+P', 'Preview');
  var saveContinue = addButton(buttonDiv, 'Shift+Alt+S', 'Save & Continue');
  var saveClose = addButton(buttonDiv, 'Alt+S', 'Save & Close');
  var cancel = addButton(buttonDiv, 'Alt+C', 'Cancel');

  var spawn = function(gadgetPath, action, getData, putData) {
    if (action === 'edit') {
      $(buttonDiv).css({});
    } else {
      $(saveContinue).css({display:'none'});
      $(saveClose).css({display:'none'});
      $(cancel).attr('value', 'Close');
    }
    gadgetPath = gadgetPath.replace(/^\/|\.js$/g, '');
    var gadgetInstance;
    require([gadgetPath], function(gadget) {
      gadgetInstance = gadget(function(type, cb) {
        Converter.convert(getData, type, cb);
      }, targetDiv, 'edit');
    });

    SimpleModalOSX(function(modal) {
      $(cancel).click(function() { modal.close(); });

      // Close is called back twice, beginning and complete. We reload on the second call.
      var close = modal.close;
      modal.close = function() {
        if (close) {
          close.apply(modal, []);
          close = undefined;
        } else {
          window.location.reload();
        }
      };

      var save = function(cb) {
        var note = new XWiki.widgets.Notification('Saving', 'inprogress');
        Converter.convert(gadgetInstance.getData, 'blob', function(err, ret) {
          if (err) {
            note.replace(new XWiki.widgets.Notification('Error: ' + err, 'error'));
            return;
          }
          putData(ret, function(err) {
            if (err) {
              note.replace(new XWiki.widgets.Notification('Error: ' + err, 'error'));
              return;
            }
            note.replace(new XWiki.widgets.Notification('Saved', 'done'));
            if (typeof(cb) === 'function') { cb(); }
          });
        });
      };

      $(saveClose).click(function() {
        save(function() { setTimeout(function() { modal.close(); }, 750); });
      });
      $(saveContinue).click(function() {
        save();
      });

      console.log("done");
    });
  };

  return {
    spawn: spawn,

    injectEditButton: function (domLocation, actions, getData, putData) {
      if (!actions.edit) { return; }
      $(domLocation).prepend('<a href="#">' +
        '<img src="/xwiki/resources/icons/silk/pencil_add.png">' +
        '</a>');
      var a = $(domLocation).children()[0];
      $(a).click(function(ev) {
        ev.stopPropagation();
        spawn(actions.edit, 'edit', getData, putData);
      });
    },
  };
});
