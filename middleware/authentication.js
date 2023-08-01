import User from "../models/user.js";
import jwt from "jsonwebtoken"

const authentication = async (req, res, next) => {

        try {
            const token = req.cookies.jwtCookie;
            const verify = jwt.verify(token, process.env.SECRET_KEY);
            const rootUser = await User.findOne({ _id: verify._id })
            if (!rootUser) {
                throw new Error("problem in authentication")
            }
            req.rootUser = rootUser
            req.token = token;
            req.userId = rootUser._id;
            next()
        } catch (error) {
            res.status(400).json(`this is a authentication catch error :  ${error}`  )
        }
}

export default authentication