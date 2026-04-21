# Use Node.js as the base image
FROM node:18-slim

# Install Python and Tesseract OCR (Required for your AI & OCR features)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend dependencies
COPY package*.json ./
RUN npm install --production

# Create python command alias
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy the server source code
COPY . .

# Expose the API port
EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "index.js"]
