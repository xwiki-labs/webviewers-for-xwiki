# WebViewer Interface

## Motivation
Given `m` web based file viewers or editors (henceforth "gadgets") and `n` unique pieces of
website framework software (henceforth "frameworks"), to allow any gadget to be deployed on any
framework requires `m * n` unique integrations, IE: integrating each gadget with each framework.
With the proliferation of gadgets and frameworks, it is now more efficient to develop a plugin
system for managing the communication between gadgets and frameworks, thus the total number of
integrations is `m + n` rather than `m * n`.

### Hosted Gadgets
A gadget to "email this to a friend with gmail" or "submit to reddit" do things which inherently
require hosting. Other gadgets such as "edit with google docs" might be theoretically portable but
in practice are proprietary SaaS. Ability to integrate these things in a web framework is desirable.

### Extension Gadgets
Some kinds of gadgets such as "edit with photoshop" are associated with applications on the client
computer. Even a portable or hosted gadget might be available but not be installed on a given
framework. In these cases the client may want to use a browser extension to splice a gadget into a
framework.


## The Gadget
The gadget is portable from one system to another in the form of a `zip` file, this file contains
at least one Javascript file and one JSON file. The Javascript file may have any name but the JSON
file must be named `package.json`.

### package.json
The package.json file is an extension of the format defined by npm[1] the fastest growing extension
system in the world[2]. As with npm, the "name" and "version" fields are required, but in addition
to npm, a field called "resilience" is also required , this field must be a hash which tells the
framework which file types can be acted upon by the gadget. Active keys in the "resilience" hash
are "actions" and "main". The "main" key is optional and contains the name of the Javascript file
which is the main entry point into the gadget, the default value is "main.js". The "actions" key
is required and contains a hash where the keys are string representations of the actions to carry
out and the values are lists of file types.

Example:

    {
        "name": "sample-gadget",
        "version": "0.1.0",
        "resilience": {
            "main": "entry-point.js",
            "actions": {
                "edit":["c","java","txt","js"],
                "view":["c","java","txt","js"]
            }
        }
    }

#### File Types
It is worth noting that the file types used are *not* MIME types, while MIME types may be used
in a future specification, the file types are based on filename extensions because demanding the
framework provide MIME information places a heavy burdon on the framework and the simple filename
extension `.js` may be mapped to the mime types `application/x-javascript`, `text/javascript` or
`application/javascript`, and since the framework cannot be trusted to use the "right" one,
filename extensions are currently preferred.

#### Action Names
While the WebIntents specification[3] represented action names using URLs[4], this is seen as
overkill and the meaning of names like "edit" and "view" was judged to be universally recognizable.

### main.js
The main entry point into the gadget is a Javascript file containing an AMD style `define()`
function call. The define() must return a function which takes 4 parameters.

1. **getData** `<function>` called with 2 parameters to get the data which the framework wants the
gadget to act upon. The first parameter is a string representation of the format desired, valid
strings are "blob" and "text", the second parameter is a **getData callback** (see below).
2. **domLocation** `<DOMElement>` the gadget is expected to place itself in the web page by adding
a child element to this DOM node. The rendered size of this element represents the size which the
framework wants the gadget to be.
3. **action** `<string>` the string representation of the action to perform upon the data.
4. **params** `<string|undefined>` gadget specific additional parameters, this is expected to be
passed from the user who invokes the gadget to the gadget itself and the framework is discouraged
from altering it. If **params** is set to "help" the gadget developer is encouraged to show
information about the gadget and what other things may be passed in the **params** argument.

This function's return value is a Javascript object containing at least one field called *getData*.
The value of this field is a function taking one parameter which is a **getData callback**. If the
gadget is doing an action such as *edit* which alters the data, this function shall be called by
the framework to get the current state of the data from the gadget in order to save. The gadget
may call save with either a Blob or a string and it is the job of the framework to convert the data
to it's native format for storage.

Example:

    define(['jquery'], function($) {
      var HELP = "This is the plain text editor gadget, it allows editing of plain text " +
                 "documents with a .txt extension. It doesn't have any configuration " +
                 "parameters except for 'help' which displays this message.";

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


#### getData callback
The getData callback is a generic callback which is passed to the two getData functions. This
callback function takes two parameters.

1. **err** `<string|undefined>` if not `undefined` then getting the data failed.
2. **ret** `<string|Blob|undefined>` if **err** is `undefined` then **ret** shall not be **ret**
shall represent the content which is to be loaded or saved.



[1](https://npmjs.org/doc/json.html)
[2](http://modulecounts.com/)
[3](https://dvcs.w3.org/hg/web-intents/raw-file/tip/spec/Overview.html)
[4](https://dvcs.w3.org/hg/web-intents/raw-file/tip/spec/Overview.html#attributes)
