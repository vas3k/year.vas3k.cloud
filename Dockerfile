FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Ensure CRA dev server binds to all interfaces
ENV HOST=0.0.0.0
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000

CMD ["npm", "run", "dev"]