"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = __importDefault(require("zod"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const signupSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
    role: zod_1.default.nativeEnum(client_1.Role),
    firstname: zod_1.default.string(),
    lastname: zod_1.default.string(),
});
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid input.' });
        return;
    }
    const { email, password, role, firstname, lastname } = result.data;
    const check = yield prisma.user.findUnique({ where: { email } });
    if (check) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    try {
        const user = yield prisma.user.create({
            data: {
                email,
                password: yield bcrypt_1.default.hash(password, 10),
                role,
                firstName: firstname,
                lastName: lastname
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token, message: 'Signup successful' });
    }
    catch (e) {
        res.status(400).json({ message: 'Signup failed' });
        return;
    }
}));
const loginSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
});
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid input.' });
        return;
    }
    const { email, password } = result.data;
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(400).json({ message: 'User not found.' });
        return;
    }
    const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordMatch) {
        res.status(400).json({ message: 'Invalid password.' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, message: 'Login successful' });
}));
exports.default = router;
