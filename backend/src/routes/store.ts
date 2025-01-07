import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import z from "zod";
import { authMiddleware,authorize } from "../middlewares/authmiddleware";
const router = express.Router();

const prisma = new PrismaClient();

const storeSchema=z.object({
    name:z.string(),
    description:z.string().optional(),
    domain:z.string(),
})


router.post('/createStore',authMiddleware,authorize(['MERCHANT']),async(req:Request,res:Response)=>{
    const storeData=storeSchema.safeParse(req.body);
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const ownerId = req.user.userId;

    if(!storeData.success){
        res.status(400).json({error:storeData.error});
        return;
    }

    const {name,description,domain}=storeData.data;

    try{
    const store=await prisma.store.create({
        data:{
            ownerId:Number(ownerId),
            name,
            description,
            domain
        }
    });

    res.json(store);
}catch(e){
    res.status(500).json({error:"Something went wrong",e});
}
})

const storeConfigSchema = z.object({
    storeId: z.number(),
    theme: z.string(),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    metadata: z.any().optional(),
});

router.post('/createStoreConfig',authMiddleware,authorize(['MERCHANT']),async(req:Request,res:Response)=>{
   const storeData=storeConfigSchema.safeParse(req.body);
    if(!req.user){
         res.status(401).json({error:"Unauthorized"});
         return;
    }
    const ownerId=req.user.userId;

    if(!storeData.success){
        res.status(400).json({error:storeData.error});
        return;
    }

    const {storeId,theme,logoUrl,bannerUrl,primaryColor,secondaryColor,metadata}=storeData.data;

    try{
        const store=await prisma.store.findFirst({
            where:{
                id:storeId,
                ownerId:Number(ownerId)
            }
        });

        if(!store){
            res.status(404).json({error:"Store not found"});
            return;
        }

        const storeConfig=await prisma.storeConfig.create({
            data:{
                storeId,
                theme,
                logoUrl,
                bannerUrl,
                primaryColor,
                secondaryColor,
                metadata
            }
        });

        res.json(storeConfig);
    }catch(e){
        res.status(500).json({error:"Something went wrong",e},);
    }

})