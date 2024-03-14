# Auto Grader Server

This is the server for [Auto Grader](../README.md). It is a REST API built using Node.js and Express.js.

## Installation

1. Clone the repo, if you haven't already
```sh
git clone https://github.com/oezeb/auto-grader.git
```
2. Install dependencies
```sh
cd server
npm install
```
3. Set the following environment variables:
```sh
# SERVER
PORT=<server port> # optional, defaults to 5000

# DATABASE
MONGODB_URI=<your mongodb uri>
MONDODB_TEST_URI=<mongodb uri for testing> 

# JWT TOKEN for authentication
JWT_SECRET=<your jwt secret>
JWT_LIFETIME=<jwt lifetime in seconds>
```
> Can also create a `.env` file in the root directory of the project, and add the above environment variables there.
4. Start the server
```sh
npm start
```
