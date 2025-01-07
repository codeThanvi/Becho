import express from 'express';
import { Response,Request } from 'express';
import bcrypt from 'bcrypt';
import z from "zod";
import jwt from 'jsonwebtoken';
import { PrismaClient,Role } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();


const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(Role),
    firstname: z.string(),
    lastname: z.string(),

});

router.post('/signup', async (req: Request, res: Response) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid input.' });
        return;
    }

    const { email, password, role, firstname, lastname } = result.data;

    const check=await prisma.user.findUnique({where:{email}});
    if(check){
        res.status(400).json({message:'User already exists'});
        return;
    }

    try{
    
    const user= await prisma.user.create({
        data:{
            email,
            password: await bcrypt.hash(password,10),
            role,
            firstName:firstname,
            lastName:lastname
        }
    })

    const token=jwt.sign({userId:user.id,role:user.role},process.env.JWT_SECRET!);
    res.json({token,message:'Signup successful'});
}
catch(e){
    res.status(400).json({message:'Signup failed'});
    return;
}
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

router.post('/login', async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid input.' });
        return;
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(400).json({ message: 'User not found.' });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        res.status(400).json({ message: 'Invalid password.' });
        return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!);
    res.json({ token, message: 'Login successful' });
});


export default router;