import java.util.zip.ZipInputStream;
import java.io.StringWriter;
import org.apache.commons.io.IOUtils;
import groovy.json.JsonSlurper;

String getPkg(doc, attach, ctx) {
    def zis = new ZipInputStream(
        doc.getAttachment(attach).getAttachment().getContentInputStream(ctx.getContext()));
    def entry;
    while ((entry = zis.getNextEntry()) != null) {
        def entryName = entry.getName();
        if (!"package.json".equals(entryName)) { continue; }
        def writer = new StringWriter();
        IOUtils.copy(zis, writer, "UTF-8");
        return writer.toString();
    }
    return null;
}

String doZip(xcontext, doc, fileName, fileType, action) {
    def j = new JsonSlurper().parseText(getPkg(doc, fileName, xcontext));
    def actions = j.get("resilience").get("actions");
    def out = j.get("resilience").get("main");
    if (!out) { out = j.get("main"); }
    if (!out) { out = "index.html"; }
    for (Object k : actions.keySet()) {
        if (action.equals(k) && actions.get(k).contains(fileType)) { return out; }
    }
    return null;
}

public String run(Object xcontext, Object doc, String fileType, String action) {
    out = '';
    for (Object o : doc.getAttachmentList()) {
        if (!o.getFilename().endsWith('.zip')) { continue; }
        //try {
            def s = doZip(xcontext, doc, o.getFilename(), fileType, action);
            if (s != null) {
                return doc.getAttachmentURL(o.getFilename()) + "/" + s;
            }
        //} catch (e) { out += e; }
    }
    return out;
}
