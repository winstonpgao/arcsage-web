FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DB_PATH=/data/telemetry.sqlite3 \
    BIND_HOST=0.0.0.0 \
    PORT=8080 \
    REPORT_ENABLED=0
COPY collector.py /app/collector.py
RUN mkdir -p /data && chown 10001:10001 /data
USER 10001:10001
EXPOSE 8080
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','8080')+'/health',timeout=3)"
CMD ["python", "/app/collector.py"]
