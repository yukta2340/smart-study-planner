# --- STAGE 1: Build Frontend ---
FROM node:18-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- STAGE 2: Build Backend ---
FROM node:18-slim
WORKDIR /app

# Install Python and Tesseract OCR (Needed for AI/OCR features)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Create python command alias
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy server code
COPY server/ ./server/

# Copy built frontend from STAGE 1
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port and start
WORKDIR /app/server
EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "index.js"]
