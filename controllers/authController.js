const User = require("../models/User")
const jwt = require("jsonwebtoken")

//generate jwt token
const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET, {expiresIn: "1h"})
}

//Register user
exports.registerUser = async(req, res) => {
    const{fullName, email, password, profileImageUrl} = req.body

    //validation check for missing fields
    if(!fullName || !email || !password){
        return res.status(400).json({message: "All fields are required"})
    }

    try{
        const existingUser = await User.findOne({email})
        if (existingUser){
            return res.status(400).json({message: "Email already in use"})
        }

        //create the user
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        })

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        })
    } catch(err){
        res
            .status(500)
            .json({message:"Error registering user", error: err.message})
    }
}

//Login user
exports.loginUser = async(req, res) => {
    const {email, password} = req.body
    if (!email, !password){
        return res.status(400).json({message:"All fields are required"})
    } try {
        const user = await User.findOne({email})
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({message:"Invalid credentials"})
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        })
    } catch(err){
        res
            .status(500)
            .json({message:"Error registering user", error: err.message})
    }
}

//Get user info
exports.getUserInfo = async(req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password")

        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        res.status(200).json(user)
    } catch(err){
        res
            .status(500)
            .json({message:"Error registering user", error: err.message})
    }
}

//Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Atualiza campos se forem enviados
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (password) user.password = password; 

        if (req.file) {
            user.profileImageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({
            message: "Perfil atualizado com sucesso",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Erro ao atualizar o perfil", error: err.message });
    }
};
