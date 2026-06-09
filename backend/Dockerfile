FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    pandoc \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz \
      | tar xz -C /usr/local/bin/

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY main.py .

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
