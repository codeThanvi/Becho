import express from 'express';
import cors from 'cors';
const app=express();
import mainRouter from './routes/index';
const PORT= 3000;

app.use(express.json());
app.use(cors());

app.use('/api/v1',mainRouter);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

