from bleach import Cleaner

ALLOWED_TAGS = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'hr',
    'table', 'thead', 'tbody', 'tr', 'td', 'th', 'figure', 'figcaption',
]

ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title']

_cleaner = Cleaner(
    tags=ALLOWED_TAGS,
    attributes={**{t: ALLOWED_ATTR for t in ['a', 'img']}, '*': ['class']},
    protocols=['http', 'https', 'mailto'],
    strip=True,
)


def sanitize_content(html):
    if not html:
        return html
    return _cleaner.clean(html)