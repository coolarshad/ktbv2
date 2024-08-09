
# Use a Python image that includes the correct version
FROM python:3.10

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files
COPY . .

# Expose port 8000 for Django
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "ktbv2.wsgi:application", "--bind", "0.0.0.0:8000"]
