package com.mindlog.services.imports;

/** Limites de uma importação. O tamanho do envio (5 MB) fica em {@code spring.servlet.multipart}. */
public final class ImportLimits {

    /** Bytes depois de descompactar (ZIP, gz). */
    public static final long MAX_UNCOMPRESSED_BYTES = 20L * 1024 * 1024;

    public static final int MAX_ENTRIES = 5_000;

    /** Título da entrada: mesmo teto da coluna {@code user_media.title}. */
    public static final int MAX_TITLE_LENGTH = 255;

    private ImportLimits() {
    }
}
