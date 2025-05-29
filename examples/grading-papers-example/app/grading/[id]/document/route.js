import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET(
  _req,
  { params }
) {
  // docs/<id>.docx  →  docs/assign-1.docx, assign-2.docx, …
  const filename = `${params.id}.docx`;
  const filePath = path.join(process.cwd(), 'docs', filename);

  try {
    const file = await readFile(filePath);
    console.debug(`Serving document: ${filename}`);
    
    return new Response(file, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
