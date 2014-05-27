# WebViewers for XWiki

To build it manually:

    # first make sure you have an up-to-date version of node-xwikimodel
    git clone git://github.com/xwiki-contrib/node-xwikimodel.git
    cd node-xwikimodel
    npm install -g


    # then run the builder
    ./do

    # and import the resulting XAR file.

To install the files directly to an XWiki installation, use:

    ## The format is --post <username>:<password>@<hostname>:<port>/<servlet>
    ./do --post Admin:admin@192.168.1.1:8080/xwiki

To generate a maven build:

    ./do --mvn
