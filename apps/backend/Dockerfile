# A lightweight Python image
FROM python:3.11-slim

# The working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
# Note: I copy from the local 'app' folder to the container '/app'
COPY app/ ./app/

# Expose the port FastAPI runs on
EXPOSE 8000

# Command to run the application using Uvicorn
# We point to app.main:app because main.py is inside the 'app' folder
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]