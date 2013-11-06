# WebViewers for XWiki

To build it manually:

    npm install
    ./do

To install the files directly to an XWiki installation, use:

    ## The format is --post <username>:<password>@<hostname>[:<port>]/<preview path>/
    ./do --post Admin:admin@192.168.1.1:8080/xwiki/bin/preview//

To generate a maven build:

    ./do --mvn
