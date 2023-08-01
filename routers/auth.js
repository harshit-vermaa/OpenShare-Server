import express from "express"
import mongoose from "mongoose";
import User from "../models/user.js"
import bcrypt from "bcrypt"
import authentication from "../middleware/authentication.js";
import multer from "multer";
import sharp from 'sharp'

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/registration', upload.single('image'), async (req, res) => {
    try {

        const { name, email, password, cpassword, bio } = req.body;
        const imageBuffer = req.file.buffer;
        if (!name || !email || !password || !cpassword) {
            return res.status(400).json('Please enter all the fields');
        }

        const emailExist = await User.findOne({ email });
        if (emailExist) {
            return res.status(400).json('Email already exists');
        } else if (password === cpassword) {
            console.log(password, cpassword)
            const imageBase64 = imageBuffer.toString('base64');
            const newUser = new User({ name, email, password, cpassword, bio, image: imageBase64, });
            await newUser.save();
            res.status(200).json('User registered successfully');
        } else {
            res.status(400).json('Passwords do not match');
        }
    } catch (error) {
        res.status(500).json('Internal server error');
        console.log(error)
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Please enter all the fields');
    }

    try {
        const userVerify = await User.findOne({ email });

        if (!userVerify) {
            return res.status(400).json('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, userVerify.password);

        let token = await userVerify.generateAuthToken();

        res.cookie('jwtCookie', token, {
            expires: new Date(Date.now() + 2589000000),
            httpOnly: true
        })

        if (isPasswordValid) {
            return res.json('Login Successfully');
        } else {
            return res.status(400).json('Invalid credentials');
        }
    } catch (error) {
        res.status(500).json('Internal server error');
    }
});

router.get("/auth", authentication, async (req, res) => {
    res.status(200).json({ user: req.rootUser, token: req.token });
    console.log("user is authorised")
})

// router.post('/upload', upload.single('image'), (req, res) => {
//     try {
//         const imageBuffer = req.file.buffer;
//         console.log(imageBuffer)
//         const user = new Image({
//             data: imageBuffer,
//             contentType: req.file.mimetype,
//         });
//     } catch (error) {

//     }
// })

router.post('/create-post', authentication, upload.single('image'), async (req, res) => {
    try {

        const imageBuffer = req.file.buffer;
        const { email, title, description } = req.body;
        if (!title || !description || !email) {
            res.status(400).json("please enter all the fields")
        }

        const emailVerify = await User.findOne({ email: email })
        if (emailVerify) {
            const imageBase64 = imageBuffer.toString('base64');
            const reviewAdd = await emailVerify.addReview({ title, description, image: imageBase64, });

            if (reviewAdd) {
                await emailVerify.save()
                console.log("review added from server")

                res.status(200).json("review added")
            } else {
                console.log("review not added in server")
                res.status(400).json("not added in server")
            }
        } else {
            res.status(400).json("email is not verified")
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

router.delete('/delete-post/:postId', authentication, async (req, res) => {
    try {
        const postId = req.params.postId;
        const user = req.rootUser;

        // Find the post by post ID
        const postIndex = user.reviews.findIndex((post) => post._id.toString() === postId);
        if (postIndex === -1) {
            return res.status(404).json({ error: "Post not found" });
        } else {

            // Remove the post from the reviews array
            user.reviews.splice(postIndex, 1);
            await user.save();

            res.status(200).json("post deleted");
        }
    } catch (error) {
        res.status(500).json("error is : " + error);
    }
});

router.get('/home', async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).json(users)
    } catch (error) {
        console.log("home error :", error)
    }
})

// router.get('/logOut', async (req, res) => {
//     res.clearCookie('jwttoken', { path: '/' })
//     res.status(200).json("Logout")
//     console.log("Cookie removed")
// })




export default router;