import java.util.zip.ZipInputStream;
import java.util.HashMap;
import java.util.Arrays;
import java.io.StringWriter;
import org.apache.commons.io.IOUtils;
import groovy.json.JsonSlurper;
import java.util.Collections;

import org.xwiki.observation.ObservationManager;
import org.xwiki.observation.EventListener;
import org.xwiki.bridge.event.DocumentUpdatedEvent;
import org.xwiki.observation.event.Event;
import com.xpn.xwiki.web.Utils;
import com.xpn.xwiki.api.Context;

class AttachEventListener implements EventListener
{
    // don't do this.
    public static AttachEventListener INSTANCE = new AttachEventListener();

    public Map actionMappings;

    String getName() {
        return "Resilience.attachmentUploadListener";
    }

    List<Event> getEvents() {
        return Arrays.asList(new DocumentUpdatedEvent())
    }

    void onEvent(Event event, Object source, Object data) {
        if ("Resilience.Gadgets".equals(source.fullName)) {
            this.check(new Context(data), true);
        }
    }

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

    Map doZip(xcontext, doc, fileName, out) {
        def j = new JsonSlurper().parseText(getPkg(doc, fileName, xcontext));
        def actions = j.get("resilience").get("actions");
        def main = j.get("resilience").get("main");
        if (!main) { main = "index.html"; }
        for (Object action : actions.keySet()) {
            for (Object fileType : actions.get(action)) {
                def hm = out.get(fileType);
                if (!hm) {
                    hm = new HashMap();
                    out.put(fileType, hm);
                }
                hm.put(action,  doc.getAttachmentURL(fileName) + "/" + main);
            }
        }
        return out;
    }

    public void check(xcontext, force) {
        if (this.actionMappings != null) {
            if (!force) { return; }
        }
        def xc = xcontext.getContext();
        def doc = xc.getWiki().getDocument("Resilience","Gadgets",xc).newDocument(xc);
        def am = new HashMap();
        for (Object o : doc.getAttachmentList()) {
            if (!o.getFilename().endsWith(".zip")) { continue; }
            //try {
                doZip(xcontext, doc, o.getFilename(), am);
            //} catch (e) { out += e; }
        }
        this.actionMappings = Collections.unmodifiableMap(am);

        if (!force) {
            Utils.getComponent(ObservationManager.class).removeListener(getName());
            Utils.getComponent(ObservationManager.class).addListener(AttachEventListener.INSTANCE);
        }
    }
}

public Map run(xcontext) {
    AttachEventListener.INSTANCE.check(xcontext, false);
    return AttachEventListener.INSTANCE.actionMappings;
}
