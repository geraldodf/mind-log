package com.mindlog.services.imports;

import com.mindlog.data.dtos.imports.ImportIssueDTO;
import com.mindlog.data.enums.ImportSource;
import org.springframework.stereotype.Component;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.zip.GZIPInputStream;

/** Export do MAL ({@code .xml} ou {@code .xml.gz}): um {@code <anime>} ou {@code <manga>} por entrada. */
@Component
public class MyAnimeListParser implements ImportParser {

    private static final String FILE = "myanimelist.xml";

    @Override
    public ImportSource source() {
        return ImportSource.MYANIMELIST;
    }

    @Override
    public ParsedImport parse(InputStream in) throws IOException {
        List<ImportedEntry> entries = new ArrayList<>();
        List<ImportIssueDTO> issues = new ArrayList<>();
        try (InputStream xml = open(in)) {
            XMLStreamReader reader = factory().createXMLStreamReader(xml);
            try {
                boolean root = false;
                long row = 0;
                while (reader.hasNext()) {
                    if (reader.next() != XMLStreamConstants.START_ELEMENT) continue;
                    String name = reader.getLocalName();
                    if (!root) {
                        if (!"myanimelist".equals(name)) throw ImportErrors.invalid();
                        root = true;
                    } else if ("anime".equals(name) || "manga".equals(name)) {
                        read(++row, "anime".equals(name) ? "Anime" : "Manga", fields(reader, name), entries, issues);
                    }
                }
                if (!root) throw ImportErrors.invalid();
            } finally {
                reader.close();
            }
        } catch (XMLStreamException e) {
            throw ImportErrors.invalid();
        }
        return new ParsedImport(entries, issues);
    }

    private void read(long row, String mediaType, Map<String, String> fields,
                      List<ImportedEntry> entries, List<ImportIssueDTO> issues) {
        String title = ImportText.blankToNull(fields.get("series_title"));
        if (title == null) title = ImportText.blankToNull(fields.get("manga_title"));
        String titleIssue = ImportText.titleIssue(title);
        if (titleIssue != null) {
            issues.add(new ImportIssueDTO(FILE, row, titleIssue, ImportText.clip(title)));
            return;
        }
        String rawStatus = fields.get("my_status");
        String status = statusOf(rawStatus);
        if (status == null) {
            issues.add(new ImportIssueDTO(FILE, row, "status.unknown", ImportText.clip(rawStatus)));
            return;
        }
        Integer rating = null;
        String rawScore = fields.get("my_score");
        try {
            rating = ImportText.toStars(rawScore, 10);
        } catch (IllegalArgumentException e) {
            issues.add(new ImportIssueDTO(FILE, row, "rating.invalid", ImportText.clip(rawScore)));
        }
        entries.add(new ImportedEntry(
                title.trim(),
                mediaType,
                status,
                rating,
                ImportText.isoDate(fields.get("my_start_date")),
                ImportText.isoDate(fields.get("my_finish_date")),
                ImportText.blankToNull(fields.get("my_comments")),
                null));
    }

    /** Filhos de um {@code <anime>}/{@code <manga>} como mapa nome → texto. */
    private Map<String, String> fields(XMLStreamReader reader, String parent) throws XMLStreamException {
        Map<String, String> fields = new HashMap<>();
        while (reader.hasNext()) {
            int event = reader.next();
            if (event == XMLStreamConstants.END_ELEMENT && parent.equals(reader.getLocalName())) break;
            if (event == XMLStreamConstants.START_ELEMENT) {
                String name = reader.getLocalName();
                fields.put(name, reader.getElementText());
            }
        }
        return fields;
    }

    private String statusOf(String raw) {
        if (raw == null) return null;
        return switch (raw.trim().toLowerCase(Locale.ROOT)) {
            case "completed", "2" -> "Completed";
            case "watching", "reading", "1" -> "In Progress";
            case "on-hold", "on hold", "onhold", "3" -> "Paused";
            case "dropped", "4" -> "Dropped";
            case "plan to watch", "plan to read", "6" -> "Planned";
            default -> null;
        };
    }

    /** O MAL entrega {@code .xml.gz}: reconhece pelo cabeçalho do gzip, não pelo nome. */
    private InputStream open(InputStream in) throws IOException {
        BufferedInputStream buffered = new BufferedInputStream(in);
        buffered.mark(2);
        int first = buffered.read();
        int second = buffered.read();
        buffered.reset();
        InputStream plain = first == 0x1f && second == 0x8b ? new GZIPInputStream(buffered) : buffered;
        return new LimitedInputStream(plain, ImportLimits.MAX_UNCOMPRESSED_BYTES);
    }

    /** Sem DTD nem entidades externas: o XML não pode abrir arquivos nem URLs do servidor. */
    private XMLInputFactory factory() {
        XMLInputFactory factory = XMLInputFactory.newFactory();
        factory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
        factory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);
        factory.setProperty(XMLInputFactory.IS_COALESCING, true);
        return factory;
    }
}
