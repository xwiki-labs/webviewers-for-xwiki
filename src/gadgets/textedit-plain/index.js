define(['jquery'], function($) {
  var HELP = "This is the plain text editor gadget, it allows editing of plain text documents " +
    "with the .txt extension. It doesn't have any configuration parameters except for 'help' " +
    "which displays this message.";

  return function(getData, domLocation, action, params) {
    $(domLocation).prepend('<textarea cols="1" rows="1"></textarea>');
    var ta = $($(domLocation).children()[0]);
    ta.css({width:"100%", height:"100%"});
    if (params === 'help') {
      ta.val(HELP)
    } else {
      getData('text', function(err, ret) {
        if (err) { return ta.val(err.stack); }
        ta.val(ret);
      });
    }
    return { getData: function(cb) { cb(undefined, ta.val()); } };
  };
});
