/**
 * Escapes HTML special characters to prevent XSS attacks
 * Converts: & < > " '
 * To: &amp; &lt; &gt; &quot; &#039;
 * 
 * @param text - The text to escape
 * @returns The escaped text safe for HTML insertion
 * 
 * @example
 * ```typescript
 * const userInput = "<script>alert('XSS')</script>";
 * const safe = escapeHtml(userInput);
 * // Result: "&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;"
 * // Browser renders as TEXT, not CODE
 * ```
 */
export function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Escapes HTML for attribute values (more aggressive)
 * Use when inserting into HTML attributes like: <div title="${value}">
 * 
 * @param text - The text to escape for attribute context
 * @returns The escaped text safe for HTML attributes
 */
export function escapeHtmlAttribute(text: string): string {
    return escapeHtml(text)
        .replace(/\n/g, '&#10;')
        .replace(/\r/g, '&#13;')
        .replace(/\t/g, '&#9;');
}

/**
 * Sanitizes JSON for safe display in HTML
 * Useful for displaying template data in UI
 * 
 * @param json - The JSON string to sanitize
 * @returns The sanitized JSON safe for display
 */
export function sanitizeJsonForDisplay(json: string): string {
    try {
        // Parse to validate, then stringify with formatting
        const parsed = JSON.parse(json);
        const formatted = JSON.stringify(parsed, null, 2);
        return escapeHtml(formatted);
    } catch (e) {
        // If invalid JSON, just escape as-is
        return escapeHtml(json);
    }
}
