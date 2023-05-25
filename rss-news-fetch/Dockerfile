FROM node:alpine
WORKDIR /app
COPY package*.json ./

COPY .npmrc ./

RUN npm install

# COPY
COPY . .

# Run and expose the server on port 5000
EXPOSE 5000

# A command to start the server
CMD ["npm", "start"]