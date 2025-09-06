import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classifyBlockOrInline } from './classify.js';
import { runBlockOrInlineCLI } from './cli.js';

vi.mock('./classify.js', () => ({
  classifyBlockOrInline: vi.fn(),
}));

describe('runBlockOrInlineCLI', () => {
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('prints usage and exits if no qname is provided', async () => {
    await expect(runBlockOrInlineCLI([])).rejects.toThrow('process.exit called');
    expect(errorSpy).toHaveBeenCalledWith('Usage: ooxml block-or-inline <QName> [--xsd <dir>] [--depth <n>] [--json]');
    expect(exitSpy).toHaveBeenCalledWith(2);
  });

  it('calls classifyBlockOrInline with qname and default depth', async () => {
    classifyBlockOrInline.mockReturnValue('block');
    await runBlockOrInlineCLI(['w:r']);
    expect(classifyBlockOrInline).toHaveBeenCalledWith('w:r', 2);
    expect(logSpy).toHaveBeenCalledWith('block');
  });

  it('respects --depth argument', async () => {
    classifyBlockOrInline.mockReturnValue('inline');
    await runBlockOrInlineCLI(['w:tbl', '--depth', '5']);
    expect(classifyBlockOrInline).toHaveBeenCalledWith('w:tbl', 5);
  });

  it('prints JSON when --json is provided', async () => {
    classifyBlockOrInline.mockReturnValue('block');
    await runBlockOrInlineCLI(['w:sect', '--json']);
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ qname: 'w:sect', kind: 'block', depth: 2 }, null, 2));
  });

  it('falls back to default depth if --depth value is invalid', async () => {
    classifyBlockOrInline.mockReturnValue('inline');
    await runBlockOrInlineCLI(['w:p', '--depth', 'NaN']);
    expect(classifyBlockOrInline).toHaveBeenCalledWith('w:p', 2);
  });
});
