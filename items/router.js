'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const router = express.Router();
const jsonParser = bodyParser.json();

const {Item, builder} = require('./model');
const {User} = require('../users/model');
const {Company} = require('../company/');
const { localStrategy, jwtStrategy } = require('../auth/strategies');


passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/', jwtAuth,jsonParser, (req, res) => {
  console.log("hitting endpoint");
    const requiredFields = ['location', 'area', 'quantity', 'shape', 'size'];

    const missingField = requiredFields.find(field => !(field in req.body));
    //console.log(req.body);
    if (missingField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
      });
    }
    const stringFields = ['location', 'area', 'shape', 'size', 'remarks', 'reserve', 'grade'];
    const nonStringField = stringFields.find(
      field => field in req.body && typeof req.body[field] !== 'string'
    );
  
    if (nonStringField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Incorrect field type: expected string',
        location: nonStringField
      });
    };

    return User.findOne({username:req.user.username})
    .then(user=>{
        return Item.create({
                location: req.body.location,
                area: req.body.area,
                quantity: req.body.quantity,
                shape: req.body.shape,
                size: req.body.size,
                feet: req.body.feet,
                inches: req.body.inches,
                fraction: req.body.fraction,
                grade: req.body.grade,
                reserve: req.body.reserve,
                po:req.body.po,
                remarks: req.body.remarks,
                companyID: user.companyID,
                user: user.id,
                lastEdit: user.id,
            })
    })
    .then(item => {
      //console.log(item)
      return item.populate('user').execPopulate()
    })
    .then(item=>{
      
      return item.populate('lastEdit').execPopulate()
    })
    .then(item=>{

      res.json(item).status(200);
    })
    .catch(err => {
    // Forward validation errors on to the client, otherwise give a 500
    // error because something unexpected has happened
        if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
    }
    //debugging
    console.log(err);
        res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

/*****************GET ALL ITEMS FOR A COMPANY*************/

router.get('/', jwtAuth, jsonParser, (req, res)=>{
  let itemArr;
    const page = req.query.page;
    const companyID = req.user.companyID;
  
    if(!(page)) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing Paramter',
      });
    }

      return Item.find({companyID:companyID}).limit(20).sort({created: -1}).skip(20 * page)
      .then(items=>{
        itemArr = items;
        return Item.countDocuments();
      })
      .then(count=>{
          let item;
          const resArr = [];
          itemArr.map(singleItem =>{
            item = singleItem.serialize();
            item.count = count;
            resArr.push(item);
          })
        return res.status(200).json(resArr);
      })
      .catch(err=>{
        console.log(err);
        return res.status(500).json({code: 500, message: 'Internal server error'});
      })
    });

/*****************DELETE ONE ITEM FROM A COMPANY*************/

router.delete('/:id',jwtAuth,(req,res)=>{
    return Item.findOneAndDelete({_id:req.params.id})
      .then(item=>{
        console.log(item);
        res.status(200).json({message: 'deleted'});
      })
      .catch(err=>{
        console.log(err);
        return res.status(500).json({code: 500, message: 'Internal server error'});
      });
  });

/*****************EDIT ONE ITEM FROM A COMPANY*************/

router.put("/:id", jwtAuth, jsonParser, (req, res)=>{
    const body = req.body;
    return User.findOne({username:req.user.username})
        .then (user=>{
            body.lastEdit = user.id;
            return Item.findOneAndUpdate({_id:req.params.id}, body, { new:true})
        })
        .then(item=>{
            res.status(200).json(item)
        })
        .catch(err=>{
            //console.log(err);
            return res.status(500).json({code: 500, message: 'Internal server error'});
          });
})
/**************return CSV**************** */

router.get('/csv', jwtAuth, jsonParser,(req,res)=>{
  return Item.find({companyID:req.user.companyID})
  .then(data=>{
    let csv='';
      csv += builder.getHeaders()
      data.forEach(item => {
        csv += builder.getRow(item)
      });
  res.send(csv).status(200)
    })
  .catch(err=>{
    console.log(err)
    res.status(500).message('internal server error')
  });
})


router.get('/json', jwtAuth, jsonParser,(req,res)=>{
  console.log('here');
  return Item.find({companyID:req.user.companyID})
  .then(data=>{
    res.send(data).status(200)
    })
  .catch(err=>{
    console.log(err)
    res.status(500).message('internal server error')
  });
})



module.exports = {router};