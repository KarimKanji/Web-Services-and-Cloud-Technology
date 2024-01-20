const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authToken = require('../middleware/authToken')
const { restart } = require('nodemon')

router.get('/', authToken, async (req, res) => {

    try {
        const users = await User.find()
        res.send(users)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

router.get('/:id', authToken, async (req, res) => {

    try {
        const users = await User.findOne({
            _id: req.params.id
        })
        res.send(users)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

router.delete('/', authToken, async (req, res) => {
    try {
        const users = await User.deleteOne({
            _id: req.authUser.sub
        })

        if (users) {
            return res.status(404).send({ msg: "Deleted user successfuly or user has already been deleted " + req.authUser.sub })
        }
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }

})

router.post('/login', async (req, res) => {
    // Kolla om det finns en användare med det namnet
    const user = await User.findOne({ email: req.body.email }).exec()
    if (user == null) {
        return res.status(401).send({ msg: "No such user." })
    }

    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match) {
        return res.status(401).send({ msg: "Wrong password" })

    }

    const token = jwt.sign({
        sub: user._id, //sub = subject, användar-id
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.send({ msg: "Login ok!", token: token })

})


router.post('/', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        })
        const newUser = await user.save()
        res.send({ sparade: newUser })

    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

router.patch('/', authToken, async (req, res) => {
    try {
        //const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.authUser.sub },
            {
                $set:
                {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email//,
                    //password: hashedPassword
                }
            },
            { new: true }
        )
        res.send({ msg: "User updated", updatedUser: updatedUser })
    } catch (error) {
        res.status(500).send({ msg: error.message })

    }
})

module.exports = router