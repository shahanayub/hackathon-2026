FROM python:3.11-slim

WORKDIR /app

# Ensure pip binaries are in PATH
ENV PATH="/root/.local/bin:${PATH}"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8001}