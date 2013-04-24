# XWiki.Resilience extension

This is an experimental extension for hosting RenderJs Web Gadgets
see: http://www.renderjs.org/ for more information about RenderJs.

**NOTE:** This .zip format is not yet standardized and is yet likely to change!

To build it manually first check that node.js is installed and install `xwiki-tools` with npm.

    npm install -g xwiki-tools

Then type `./do`.

To install the files directly to an XWiki installation, use:

    ## The format is --post <username>:<password>@<hostname>[:<port>]/<preview path>/
    ./do --post Admin:admin@192.168.1.1:8080/xwiki/bin/preview//

To generate a maven build:

    ./do --mvn
