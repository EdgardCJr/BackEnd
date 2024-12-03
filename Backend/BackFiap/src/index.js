const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./Models/User');
const Post = require('./Models/Post');
const jwt = require('jsonwebtoken');
const app = express();

const jwtSecret = 'teste-segredo';

mongoose.connect('mongodb+srv://Admin1:V4CQayDicB2eJvPO@backendfiap2.yevok.mongodb.net/?retryWrites=true&w=majority&appName=BackendFiap2')

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function validateFormData(req, res) {
  const { title, content, author } = req.body;
  if (!title || !content || !author) {
    return res.status(400).send('Por favor, preencha todos os campos.');
  }
  return true;
}

function handleError(err, res) {
  console.error('Error:', err);
  res.status(500).send('Erro ao processar a requisição');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).send('Não Autorizado');

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).send('Proibido');
    req.user = user;
    next();
  });
};

const authorizeTeacher = (req, res, next) => {
  if (req.user.role !== 'professor') {CreateUser
    return res.status(403).send('Forbidden: Somente professore podem acessar.');
  }
  next();
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Recebido:', { username, password });

    const user = await User.findOne({ username });
    if (!user) {
      console.log('Usuário não encontrado');
      return res.status(401).send('Credenciais inválidas');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Senha incorreta');
      return res.status(401).send('Credenciais inválidas');
    }

    const token = jwt.sign({ id: user._id}, jwtSecret);
    console.log('Token gerado:', token); 

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Erro no servidor:', err); 
    res.status(500).send('Erro no servidor');
  }
});


app.post('/register', authenticateToken, async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already exists:', username); // Log specific error info
      return res.status(202).json({ message: 'Nome de usuário já existe, tente outro.' });
    }

    const newUser = new User({
      username,
      password,
      role,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    newUser.password = hashedPassword;

    await newUser.save();
    res.status(201).send('Usuario registrado com sucesso.');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Erro ao registrar o usuário.' });
}
});

app.get('/posts',authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    handleError(err, res);
  }
});

app.get('/posts/admin',authenticateToken, authorizeTeacher, async (req, res) => { 
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    handleError(err, res);
  }
});

app.get('/posts/search',authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const posts = await Post.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { content: new RegExp(q, 'i') },
      ],
    });
    res.json(posts);
  } catch (err) {
    handleError(err, res);
  }
});

app.get('/posts/:id',authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post não encontrado');
    res.json(post);
  } catch (err) {
    handleError(err, res);
  }
});

app.post('/posts',authenticateToken, async (req, res) => {
  if (!validateFormData(req, res)) return;
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    handleError(err, res);
  }
});

app.put('/posts/:id',authenticateToken, async (req, res) => {
  if (!validateFormData(req, res)) return;
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).send('Post não encontrado');
    res.json(post);
  } catch (err) {
    handleError(err, res);
  }
});


app.delete('/posts/:id',authenticateToken, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).send('Post não encontrado');
    res.send('Post excluído com sucesso');
  } catch (err) {
    handleError(err, res);
  }
});

app.delete('/user/:id',authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('Usuário não encontrado');
    res.send('Usuário excluído com sucesso');
  } catch (err) {
    handleError(err, res);
  }
});

app.get('/user',authenticateToken, async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    handleError(err, res);
  }
});

app.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' }); 
    }
    res.json(user);  // Return the user data as JSON
  } catch (err) {
    console.error("Error fetching user:", err);  // Log the error for debugging
    res.status(500).json({ message: 'Erro ao buscar usuário' }); // Return a 500 error with message
  }
});

app.put('/user/:id', authenticateToken, async (req, res) => {
  try {
    let updatedData = req.body;
    const userId = req.params.id; 

    if (updatedData.username) { 
      const existingUserWithUsername = await User.findOne({ username: updatedData.username, _id: { $ne: userId } });
      if (existingUserWithUsername) {
        return res.status(202).json({ message: 'Nome de usuário já existe. Escolha outro.' });
      }
    }

    if (updatedData.password) {
      const hashedPassword = await bcrypt.hash(updatedData.password, 10);
      updatedData.password = hashedPassword;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ message: 'Usuário alterado com sucesso', user }); 
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
