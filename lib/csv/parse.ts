// =============================================
// Parser CSV minimaliste (RFC 4180-ish)
// =============================================
// Suffisant pour notre usage import banque de quizz. Gère :
// - guillemets pour échapper les virgules et retours à la ligne
// - "" pour échapper un guillemet dans une valeur quotée
// - BOM UTF-8 en début de fichier
// - CRLF et LF mixtes

export function parseCSV(input: string): string[][] {
  // Strip BOM UTF-8
  let text = input.replace(/^﻿/, "");

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += c;
        i++;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
      } else if (c === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (c === "\n" || c === "\r") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        // Skip \r\n
        if (c === "\r" && text[i + 1] === "\n") i += 2;
        else i++;
      } else {
        field += c;
        i++;
      }
    }
  }
  // Dernière ligne sans newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Filtre les lignes complètement vides
  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}
