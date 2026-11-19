package com.mindlog.services.imports;

import com.mindlog.services.exceptions.FieldValidationException;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

/** Corta a leitura acima de {@code limit} bytes: protege contra arquivo compactado que explode. */
class LimitedInputStream extends FilterInputStream {

    private long remaining;

    LimitedInputStream(InputStream in, long limit) {
        super(in);
        this.remaining = limit;
    }

    @Override
    public int read() throws IOException {
        int b = super.read();
        if (b >= 0) consume(1);
        return b;
    }

    @Override
    public int read(byte[] buffer, int off, int len) throws IOException {
        int n = super.read(buffer, off, len);
        if (n > 0) consume(n);
        return n;
    }

    @Override
    public long skip(long n) throws IOException {
        long skipped = super.skip(n);
        if (skipped > 0) consume(skipped);
        return skipped;
    }

    @Override
    public boolean markSupported() {
        return false;
    }

    private void consume(long n) {
        remaining -= n;
        if (remaining < 0) throw ImportErrors.tooLarge();
    }
}
