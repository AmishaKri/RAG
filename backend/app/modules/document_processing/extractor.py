from pathlib import Path

from docx import Document as DocxDocument
from pypdf import PdfReader


SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".csv",
}


class TextExtractionError(Exception):
    pass


def extract_pdf(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)

        pages = []

        for page in reader.pages:
            text = page.extract_text() or ""

            if text.strip():
                pages.append(text)

        return "\n\n".join(pages)

    except Exception as exc:
        raise TextExtractionError(
            f"Failed to extract PDF text: {exc}"
        ) from exc


def extract_docx(file_path: str) -> str:
    try:
        document = DocxDocument(file_path)

        paragraphs = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        return "\n\n".join(paragraphs)

    except Exception as exc:
        raise TextExtractionError(
            f"Failed to extract DOCX text: {exc}"
        ) from exc


def extract_text_file(file_path: str) -> str:
    try:
        return Path(file_path).read_text(
            encoding="utf-8",
            errors="replace",
        )

    except Exception as exc:
        raise TextExtractionError(
            f"Failed to read text file: {exc}"
        ) from exc


def extract_text(
    file_path: str,
    filename: str,
) -> str:

    extension = Path(filename).suffix.lower()

    if extension == ".pdf":
        return extract_pdf(file_path)

    if extension == ".docx":
        return extract_docx(file_path)

    if extension in {".txt", ".csv"}:
        return extract_text_file(file_path)

    raise TextExtractionError(
        f"Unsupported file type: {extension}"
    )
