import { describe, it, expect } from "vitest";

// Example utility functions to test
describe("Format utilities", () => {
  describe("formatFileSize", () => {
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    it("should format bytes correctly", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1048576)).toBe("1.0 MB");
      expect(formatFileSize(5242880)).toBe("5.0 MB");
    });
  });

  describe("slugify", () => {
    // ✅ النسخة المصححة — تدعم العربي
    const slugify = (text: string): string =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")  // ← دعم Unicode (عربي + إنجليزي + أرقام)
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    it("should convert text to slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("  Hello   World  ")).toBe("hello-world");
      expect(slugify("Hello@World!")).toBe("helloworld");
      expect(slugify("مرحبا بالعالم")).toBe("مرحبا-بالعالم");
    });

    it("should handle empty strings", () => {
      expect(slugify("")).toBe("");
      expect(slugify("   ")).toBe("");
    });
  });
});