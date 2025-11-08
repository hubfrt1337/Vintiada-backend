import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// skonfiguruj origin przez zmienną środowiskową (na Render ustaw FRONTEND_URL)
const FRONTEND = process.env.FRONTEND_URL || 'https://vintiada-perfume-shop.onrender.com/';

const corsOptions = {
  origin: (origin, callback) => {
    // allow tools (no origin) or allowed frontends
    if (!origin) return callback(null, true);
    const allowed = [FRONTEND, 'http://localhost:5173'];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
};

app.use(cors(corsOptions));      // jednorazowe użycie
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



// Serwowanie frontendu z folderu dist
app.use(express.static(path.join(__dirname, 'dist')));



/*
app.get(/./, (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // jeśli nie masz buildu w dist (tryb dev), spróbuj pliku w public lub zwróć 404
      const fallback = path.join(__dirname, 'public', 'index.html');
      res.sendFile(fallback, (err2) => {
        if (err2) res.status(404).end();
      });
    }
  });
}); */



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));