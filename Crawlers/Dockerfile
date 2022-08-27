FROM  python:3.9-slim
ENV PYTHONPATH=./utils
COPY ./ /workspace
WORKDIR /workspace
RUN pip3 install -r requirements.txt
RUN python3 DetailedPostWasher.py
RUN python3 DetailedPostWasher.py
CMD ["python", "591_SuperDetector.py"]

