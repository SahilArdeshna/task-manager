const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

const multer = require('multer');

const upload = multer({
    dest: 'image',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please provide Word Document'));
        }

        cb(undefined, true);
    }
});

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

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