const express = require('express')
const router = express.Router()
const Cabin = require('../models/cabin')
const authToken = require('../middleware/authToken')



router.get('/', async (req, res) => {

    try {
        const cabins = await Cabin.find() 
        res.send(cabins)
        
    } catch (error) {
        res.status(500).send({ msg: error.message })

    }
})
router.get('/owned', authToken, async (req, res) => {
    
    try {
        const cabins = await Cabin.find({
            createdBy: req.authUser.sub
        })
    
        res.send(cabins)
    } catch (error) {
        
        res.status(500).send({ msg: req.authUser.sub })
    }
})
router.get('/:id', async (req, res) => {

    try {
        const cabins = await Cabin.findOne({
            _id: req.params.id
        })
        res.send(cabins);
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})




router.delete('/:id', authToken, async (req, res) => {
    try {
        const cabins = await Cabin.deleteOne({
            _id: req.params.id, createdBy: req.authUser.sub

        })

        if (!cabins){
            return res.send({ msg: "Not your cabin" })
        }
        res.send(cabins)
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }

})


router.post('/', authToken, async (req, res) => {
    try {
        const cabins = new Cabin({
            cabin: req.body.cabin,
            location: req.body.location,
            price: req.body.price,
            createdBy: req.authUser.sub
        })
        const newCabin = await cabins.save()
        res.send({ sparade: newCabin })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

router.patch('/:id', authToken, async (req, res) => {
    try {
        const updatedCabin = await Cabin.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.authUser.sub },
            req.body,
            { new: true }
        )
        if (updatedCabin) {
            res.send({ msg: "Cabin updated", updatedCabin: updatedCabin })
        } else {
            res.send({ msg: "Not your cabin" })
        }
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

module.exports = router