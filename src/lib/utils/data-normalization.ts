/**
 * Helper to normalize database fields which might be:
 * 1. A JSON array string: '["a", "b"]'
 * 2. A PostgreSQL array string: '{"a", "b"}'
 * 3. An actual JavaScript array: ["a", "b"]
 * 4. A single string path: "/path/to/image.jpg"
 * 5. Null or undefined
 */
export function normalizeToArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];

        // Case 1: PostgreSQL array format: {"path1","path2"}
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const inner = trimmed.slice(1, -1);
            if (!inner) return [];

            return inner.split(',').map(item => {
                let s = item.trim();
                // Remove surrounding quotes if present
                if (s.startsWith('"') && s.endsWith('"')) {
                    s = s.slice(1, -1);
                }
                return s;
            }).filter(Boolean);
        }

        // Case 2: JSON array string: ["path1","path2"]
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [trimmed];
            } catch {
                return [trimmed];
            }
        }

        // Case 3: Single string path
        return [trimmed];
    }

    return [];
}
