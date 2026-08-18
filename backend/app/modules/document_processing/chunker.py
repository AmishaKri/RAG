import re
from dataclasses import dataclass


@dataclass
class TextChunk:
    text: str
    chunk_index: int
    start_word: int
    end_word: int


def clean_text(text: str) -> str:
    text = text.replace("\x00", " ")

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = 800,
    chunk_overlap: int = 120,
) -> list[TextChunk]:

    if chunk_size <= 0:
        raise ValueError(
            "chunk_size must be greater than 0"
        )

    if chunk_overlap < 0:
        raise ValueError(
            "chunk_overlap cannot be negative"
        )

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size"
        )

    text = clean_text(text)

    if not text:
        return []

    words = text.split()

    chunks = []

    start = 0
    chunk_index = 0

    while start < len(words):

        end = min(
            start + chunk_size,
            len(words),
        )

        chunk_words = words[start:end]

        chunk = " ".join(chunk_words)

        chunks.append(
            TextChunk(
                text=chunk,
                chunk_index=chunk_index,
                start_word=start,
                end_word=end,
            )
        )

        if end >= len(words):
            break

        start = end - chunk_overlap

        chunk_index += 1

    return chunks
