define(function() {
  var DATA_TYPES = ["blob", "text"];

  /**
   * Make an HTML5 Blob object.
   * Equivilant to the `new Blob()` constructor.
   * Will fall back on deprecated BlobBuilder if necessary.
   */
  var makeBlob = function (contentArray, options) {
    var i, bb, BB;
    try {
      // use the constructor if possible.
      return new Blob(contentArray, options);
    } catch (err) {
      try {
        // fall back on the blob builder.
        BB = (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder);
        bb = new BB();
        for (i = 0; i < contentArray.length; i++) {
          bb.append(contentArray[i]);
        }
        return bb.getBlob(options ? options.type : undefined);
      } catch (errr) {
        throw err;
      }
    }
  };

  return {
    convert: function(getData, type, cb) {
      if (DATA_TYPES.indexOf(type) === -1) {
        throw new Error("invalid responseType [" + type + "]");
      }
      var fr = new FileReader();
      fr.onload = function(e) {
        // text
        cb(undefined, e.target.result);
      };

      fr.onerror = function(err) { cb(err); };

      getData(function(err, ret) {
        if (err) {
          return cb(err);
        }
        if (typeof(ret) === 'undefined' || typeof(ret) === 'function') {
          return cb('Data is ' + typeof(ret));
        }
        if (typeof(ret) === 'object') {
          if (ret.toString() !== "[object Blob]") {
            return cb('Data is a js object');
          }
        }
        if (typeof(ret) === 'string') {
          ret = makeBlob([ret], {});
        }

        if (type === 'blob') {
          cb(undefined, ret);
        } else {
          fr.readAsText(ret);
        }
      });
    }
  };
});
