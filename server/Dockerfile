# Use Node.js as the base image
FROM node:18-slim

# Install Python and Tesseract OCR
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Create python command alias (some scripts use "python")
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
