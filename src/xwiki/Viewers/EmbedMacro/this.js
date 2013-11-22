XWikiDoc(function (doc, XWiki) {
    var WikiMacroParameterClass = XWiki.model.classes.WikiMacroParameterClass;
    doc.setTitle("WebViewer Embed Macro");

    doc.addXObject(new WikiMacroParameterClass().setName("tar").setMandatory(true));
    doc.addXObject(new WikiMacroParameterClass().setName("as").setMandatory(false));
    doc.addXObject(new WikiMacroParameterClass().setName("height").setMandatory(false));
    doc.addXObject(new WikiMacroParameterClass().setName("width").setMandatory(false));
    doc.addXObject(new WikiMacroParameterClass().setName("params").setMandatory(false));
});
