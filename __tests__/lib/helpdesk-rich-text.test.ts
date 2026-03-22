import { htmlToPlainText, plainTextToHtml } from "@/lib/helpdesk-rich-text";

describe("helpdesk rich text helpers", () => {
  it("converts html to readable plain text", () => {
    expect(
      htmlToPlainText("<p>Printer <strong>offline</strong></p><p>Check <a href=\"https://example.com/file.pdf\">file</a></p>")
    ).toBe("Printer offline\nCheck file (https://example.com/file.pdf)");
  });

  it("converts plain text to escaped html paragraphs", () => {
    expect(plainTextToHtml("Line 1\nLine 2\n\n<script>alert('x')</script>")).toBe(
      "<p>Line 1<br />Line 2</p><p>&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;</p>"
    );
  });
});
