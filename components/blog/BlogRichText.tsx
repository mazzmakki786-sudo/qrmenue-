"use client"

import React, { useMemo } from "react"

/**
 * Renders the hybrid authoring format used in app/blog/[slug]/page.tsx:
 *   - "## Heading" / "### Subheading"  -> h2 / h3
 *   - lines containing raw HTML (<a href>, <strong>, <table>) -> parsed HTML
 *   - "**bold**" markdown             -> <strong>
 *   - "| a | b |" table block         -> <table>
 *   - "• " and numbered lists         -> preserved with whitespace-pre-line
 *
 * Previously the article body rendered each string as a plain <p>, so raw HTML
 * and "##" markers leaked as visible text and in-body internal links were dead.
 */

/** Convert **bold** segments to <b> so the browser's HTML parser handles them. */
function markdownBoldToHtml(input: string): string {
  return input.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
}

/**
 * Parse a "| a | b |" block into an array of cell strings per row.
 * Strips the separator row (|---|) and surrounding pipes.
 */
function parseTable(block: string): string[][] {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"))
    .map((l) => l.slice(1, -1).split("|").map((c) => c.trim()))
  return lines.filter(
    (row) => !row.every((cell) => /^:?-{2,}:?$/.test(cell.replace(/\s/g, ""))),
  )
}

export function BlogRichText({ content }: { content: string }) {
  const rendered = useMemo(() => {
    const out: React.ReactNode[] = []
    const lines = content.split("\n")
    let i = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      // Heading (### before ##)
      const h3 = trimmed.match(/^###\s+(.*)$/)
      if (h3) {
        out.push(<h3 key={out.length} className="text-lg font-bold mt-8 mb-3 text-black">{h3[1]}</h3>)
        i++
        continue
      }
      const h2 = trimmed.match(/^##\s+(.*)$/)
      if (h2) {
        out.push(<h2 key={out.length} className="text-xl md:text-2xl font-bold mt-10 mb-4 text-black">{h2[1]}</h2>)
        i++
        continue
      }

      // Table block: consume consecutive | ... | lines
      if (trimmed.startsWith("|")) {
        const blockLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          blockLines.push(lines[i])
          i++
        }
        const rows = parseTable(blockLines.join("\n"))
        if (rows.length) {
          const [head, ...body] = rows
          out.push(
            <div key={out.length} className="overflow-x-auto my-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {head.map((cell, ci) => (
                      <th key={ci} className="border border-[#E5E5E5] bg-[#F9FAFB] px-3 py-2 text-left font-semibold text-black">{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-[#E5E5E5] px-3 py-2 text-[#444]">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>,
          )
          continue
        }
      }

      // Bullet / list / step lines — preserve as-is with whitespace-pre-line
      if (/^[•\-]\s|^\d+[.)]\s|^Q[:.]/.test(trimmed) || line.startsWith("    ")) {
        out.push(
          <p key={out.length} className="whitespace-pre-line text-sm md:text-base text-[#444] leading-relaxed my-2">{line}</p>,
        )
        i++
        continue
      }

      // Plain paragraph: allow raw HTML + convert **bold**.
      // Content strings are authored in-repo (trusted) and use <a href> + <b> only.
      const html = markdownBoldToHtml(trimmed)
      out.push(
        <p key={out.length} className="text-sm md:text-base text-[#444] leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: html }} />,
      )
      i++
    }

    return out
  }, [content])

  return <>{rendered}</>
}
