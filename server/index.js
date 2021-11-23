require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cokieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./routes/index');
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cokieParser())
app.use(cors());
app.use('/api', router)
app.use(errorMiddleware)


const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        app.listen(5000, () => console.log(`Server started on port: ${PORT}`));
    } catch (e) {

    }
}

start();