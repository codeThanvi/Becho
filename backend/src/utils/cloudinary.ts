import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Path } from "typescript";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadImage = async function (filePath: string) {
    try {
        const result = await cloudinary.uploader.upload(filePath,{
            resource_type: "auto",
        });
        return result.secure_url;
    } catch (error) {
        fs.unlinkSync(filePath);
        return error;
    }
}

export default uploadImage;

