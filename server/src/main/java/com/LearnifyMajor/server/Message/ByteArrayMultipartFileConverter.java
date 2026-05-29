package com.LearnifyMajor.server.Message;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;


// The main is to make the multipart file from bytes

public class ByteArrayMultipartFileConverter implements MultipartFile {
    private final byte[] fileBytes;
    private final String filename;
    private final String contentType;

    public ByteArrayMultipartFileConverter(byte[] fileBytes, String filename, String contentType) {
        this.fileBytes   = fileBytes;
        this.filename    = filename;
        this.contentType = contentType;
    }



    @Override public String getName()             { return "file"; }
    @Override public String getOriginalFilename() { return filename; }
    @Override public String getContentType()      { return contentType; }
    @Override public boolean isEmpty()            { return fileBytes == null || fileBytes.length == 0; }
    @Override public long getSize()               { return fileBytes.length; }
    @Override public byte[] getBytes()            { return fileBytes; }
    @Override public InputStream getInputStream() { return new ByteArrayInputStream(fileBytes); }

    @Override
    public void transferTo(File dest) throws IOException {
        try (FileOutputStream out = new FileOutputStream(dest)) {
            out.write(fileBytes);
        }
    }
}
