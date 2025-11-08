# Vintiada backend
Backend created to handle data fetching inside the Vintiada e-commerce shop project.

## Features
- RESTful API for product, category, and user data
- CORS configured for secure frontend communicatio
- Express-based routing and middleware

# API endpoints


cart.json:
GET -   /api/cart
PUT - /api/cart
DELETE - /api/cart  /api/cart/:id

form.json:
GET - /api/form
POST - /api/form

# Setup
Currently, the server only allows requests from a specific origin.
To enable access from all origins, open the server.js file and update the origin property in the CORS configuration to "http://localhost:3000" or to your desired URL

```
npm install
npm run server