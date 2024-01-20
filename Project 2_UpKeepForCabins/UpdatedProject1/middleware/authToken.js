require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    console.log("authtoken")
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader?.split(' ')[1]
        const jwtBody = jwt.verify(token, process.env.JWT_SECRET)

        req.authUser = jwtBody
        console.log("Token authorized!")
    } catch (error) {

        console.log(error.message)
        res.status(401).send({
            msg: "Authorization failed.",
            error: error.message
        })
    }

    next()

}