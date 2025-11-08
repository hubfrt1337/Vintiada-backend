import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' });
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// To change the CORS configuration to allow only a specific origin change the origin value below
// example: origin: "http:localhost:3000"
const corsOptions = {
  origin: "https://vintiada.netlify.app", 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400
};

// Apply CORS configuration
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

 
//app.options('*', (req,res) => { res.setHeader('Access-Control-Allow-Private-Network','true'); res.sendStatus(204); });

const CART_PATH = join(__dirname, 'cart.json');
const FORM_PATH = join(__dirname, 'form.json');



app.get('/api/cart', async (req, res) => {
  try {
    const raw = await fs.readFile(CART_PATH, 'utf8');
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: 'Cannot read cart' });
  }
});

app.put('/api/cart', async (req, res) => {
  try {
    const newCart = req.body;
    await fs.writeFile(CART_PATH, JSON.stringify(newCart, null, 2), 'utf8');
    res.json(newCart); // zwracamy zaktualizowany koszyk
  } catch (err) {
    res.status(500).json({ error: 'Cannot write cart' });
  }
});

app.delete("/api/cart", async (req, res) => {
  try {
    await fs.writeFile(CART_PATH, JSON.stringify([], null, 2), "utf8")
    return res.json([])
  }
  catch (err) {
    res.status(500).json({error: "cannot delete card"})
  }
})



app.delete("/api/cart/:id", async (req, res) => {
  try {
    
   const id = parseInt(req.params.id)  ;
   if (Number.isNaN(id)) return res.status(400).json({error: "Invalid Id"})
  
  const raw = await fs.readFile(CART_PATH, 'utf8')
  const cart = raw ? JSON.parse(raw) : [];
  
  const index = cart.findIndex(item => item.id === id)
  if(index === -1) return res.status(404).json({error: "Item not found"})
    cart.splice(index, 1)

    await fs.writeFile(CART_PATH, JSON.stringify(cart, null, 2), "utf8" )
    return res.json(cart)
  }
  catch (err) {
    console.log("Error deleting cart item:", err)
    res.status(500).json({error: 'Cannot delete card'})
  }
})

app.post("/api/form", async (req, res) => {
  try {
    const formData = req.body;
    await fs.writeFile(FORM_PATH, JSON.stringify(formData, null, 2), "utf8")
    res.json({message: "Form data saved successfully"})
  }
  catch(err){
    res.status(500).json({error: 'Cannot process form data'})
  }
});

app.get("/api/form", async (req, res) => {
  try {
    const raw = await fs.readFile(FORM_PATH, "utf8");
    res.json(JSON.parse(raw));
  }
  catch (err) {
    res.status(500).json({error: "Cannot read form data"})
  }
});






const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));