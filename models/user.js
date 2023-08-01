import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            data: Buffer,
        },
        password: {
            type: String,
            required: true
        },
        cpassword: {
            type: String,
            required: true
        },
        tokens: [
          {
                token: {
                    type: String,
                    required: true
                }
          }
        ],
        reviews: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for unique identifier
                    required: true,
                    auto: true,
                },
                title: {
                    type: String,
                    required: true,
                    maxlength: 51,
                },
                description: {
                    type: String,
                    required: true,
                    maxlength: 301,
                },
                image: {
                    type: String,
                    data: Buffer,
                },
                categorie: {
                    type: String,
                    require: true
                },
                date: {
                    type: Date,
                    default: Date.now()
                }
            }
        ],
        bio: {
            type: String,
        }
    }
)

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})

// token generation

userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token });
        await this.save()
        return token

    } catch (error) {
        return console.log(error)
    }
}

userSchema.methods.addReview = async function ({ title, description, image }) {
    try {
        this.reviews.push({ title, description, image })
        await this.save()
        return this.reviews
    } catch (error) {
        console.log("error occured : ",  error )
    }
} 

mongoose.models = {};
mongoose.modelSchemas = {};

const User = mongoose.model("User", userSchema)

export default User