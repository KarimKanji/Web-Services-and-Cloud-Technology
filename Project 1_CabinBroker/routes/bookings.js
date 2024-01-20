const express = require('express')
const router = express.Router()
const Cabins = require('../models/cabin')
const Bookings = require('../models/booking')
const authToken = require('../middleware/authToken')

// Alla
router.get('/', authToken, async (req, res) => {
    
    try {
        const bookings = await Bookings.find()
        res.send(bookings)
    } catch (error) {
        res.status(500).send({ msg: error.message })

    }
})

//Egna
router.get('/own', authToken, async (req, res) => {
    
    try {
        const bookings = await Bookings.find({
            createdBy: req.authUser.sub
        })
        res.send(bookings)
    } catch (error) {
        res.status(500).send({ msg: error.message })

    }
})

//Specifik
router.get('/:id', async (req, res) => {
    
    try {
        const bookings = await Bookings.findOne({
            _id: req.params.id
        })
        res.send(bookings);
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

router.delete('/:id', authToken, async (req, res) => {
    try {
        const bookings = await Bookings.deleteOne({

            _id: req.params.id,
            createdBy: req.authUser.sub
        })

        if (!bookings) {
            return res.status(404).send({ msg: "not found" })
        }
        res.send(bookings)
    } catch (error) {
        res.status(500).send({ msg: error.message })

    }

})

router.post('/', authToken, async (req, res) => {
    try {
        const cabinCheck = await Cabins.findOne({
            _id: req.body.id
        })
        const collision = await Bookings.findOne({
            id: req.body.id,
            startDate: { $lte: req.body.endDate },
            endDate: { $gte: req.body.startDate }

        }).exec()

        if (!cabinCheck) {

            res.status(500).send({ msg: "Couldn't find the cabin" })

        } else if (collision) {
            res.status(500).send({ msg: "cabin is booked" })
        }
        else {
            const bookings = new Bookings({
                id: req.body.id,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                createdBy: req.authUser.sub

            })
            const newBooking = await bookings.save()
            res.send({ sparade: newBooking })
        }
    } catch (error) {
        //res.status(500).send({msg: _id})
        res.status(500).send({ msg: error.message })
    }

})

router.patch('/:id', authToken, async (req, res) => {
    try {  
        const bookCheck = await Bookings.findOne({
        _id: req.params.id, createdBy: req.authUser.sub })

        if(!bookCheck) {
            res.send({ msg: "Couldn't find this booking in your name" })
        }

        const ownBooking = await Bookings.findOne({
            createdBy: req.authUser.sub,
            id: req.body.id,
            startDate: { $lte: req.body.endDate },
            endDate: { $gte: req.body.startDate }
        }).exec()
       // kolision med egen booking
        if (ownBooking) {
            
            const collisionSec = await Bookings.findOne({
                createdBy:  {$ne: req.authUser.sub },
                id: req.body.id,
                startDate: { $lte: req.body.endDate },
                endDate: { $gte: req.body.startDate }
            }).exec()
            
            if (!collisionSec) {
                const updatedBooking = await Bookings.findOneAndUpdate(
                { _id: req.params.id, createdBy: req.authUser.sub },
                req.body,
                { new: true })
                if (updatedBooking) {
                    res.send({ msg: "Booking updated", updatedBooking: updatedBooking })
                }
          
            } else  {
                res.status(500).send({ msg: "Dates already booked by someone else" })
            }

            // icke koliderar med egen
        } else {


            const collision = await Bookings.findOne({
                id: req.body.id,
                startDate: { $lte: req.body.endDate },
                endDate: { $gte: req.body.startDate }    
            }).exec()

            if (!collision) {
                const updatedBookingSec = await Bookings.findOneAndUpdate(
                    { _id: req.params.id, createdBy: req.authUser.sub },
                    req.body,
                    { new: true })
                    if (updatedBookingSec) {
                        res.send({ msg: "Booking updated", updatedBookingSec: updatedBookingSec })
                    }
            }else {
                res.status(500).send({ msg: "Dates already booked by someone else" })
            }
            
        }
        
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

module.exports = router