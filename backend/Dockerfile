FROM python:3.9
WORKDIR /app

#Copy requirments file to working directory
COPY ./requirements.txt .

RUN pip install -r requirements.txt
COPY . .
EXPOSE 80

CMD ["fastapi", "run", "app/main.py", "--port", "80"]