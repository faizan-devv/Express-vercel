#----------------------------------------------------------
# Step 1: Build React App
#----------------------------------------------------------
FROM node:erbium as react-app-build

# Create app directory
WORKDIR /usr/src/app/

COPY ./client/package*.json ./
RUN npm install

ARG REACT_APP_ENV
ENV REACT_APP_ENV=${REACT_APP_ENV}

COPY ./client/ ./
RUN npm run build

#----------------------------------------------------------
# Step 2: Build Development Project
#----------------------------------------------------------
FROM node:erbium

# Create app directory
WORKDIR /usr/src/app/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

# If you are building your code for production
RUN npm ci --only=production

ARG ENVIRONMENT
ENV CONFIG_ENV=${ENVIRONMENT}

# Bundle app source for server
# We got the client build above
COPY ./index.js ./
COPY ./server/ ./server/
COPY ./config/ ./config/

# Get the front end build from the previous step
COPY --from=react-app-build /usr/src/app/build /usr/src/app/client/build

VOLUME /usr/src/app/client/build

EXPOSE 3000
CMD [ "node", "index.js" ]
