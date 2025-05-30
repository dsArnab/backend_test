const express = require ('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const app = express();
const PORT = 8080;

app.use(express.json());

const loadUsers = () =>{
    if (!fs.existsSync('users.json')){
        fs.writeFileSync('users.json', JSON.stringify([]));
    }
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post('/register', async (req, res) => {
    const {username, email, password} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({message: 'All the fields are required'});
    }
    if (!isValidEmail(email)){
        return res.status(400).json({message: 'Invalid email format'});
    }
    if (password.length < 8) {
        return res.status(400).json({message: 'Password must be at least 8 characters'});
    }

    const users = loadUsers();

    const existingUser = users.find (u => u.email === email || u.username === username);
    if (existingUser){
        return res.status(409).json({message: 'User already exists'});
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
        userId: newUser.id,
        message: 'User registration is successful'
    });
});

app.listen(PORT, () =>{
    console.log (`Server is running at http://localhost:${PORT}`);
});
