const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

// It parses incoming requests with JSON payloads and is based on body-parser. Returns middleware that only parses JSON.
app.use(express.json());  

// user router from router folder
app.use(userRouter);
app.use(taskRouter);

app.use((req, res, next) => {
    res.status(404).send('Page not found')
});

// listen server on port 
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
