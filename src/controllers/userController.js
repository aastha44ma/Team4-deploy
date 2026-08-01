// Dummy Database
const users = [
    {
        id: 1,
        name: "Roshan Kumar",
        email: "roshan@gmail.com"
    },
    {
        id: 2,
        name: "Rahul",
        email: "rahul@gmail.com"
    }
];

// GET Users
const getUsers = (req, res) => {
    res.json(users);
};

// POST User
const createUser = (req, res) => {

    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email
    };

    users.push(newUser);

    res.status(201).json({
        message: "User Created Successfully",
        user: newUser
    });
};

module.exports = {
    getUsers,
    createUser
};