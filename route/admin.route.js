const express = require('express');
var router = express.Router();
const path = require('path');
const uniqid = require('uniqid');
const bodyParser = require('body-parser');
const multer = require('multer');
const subjectModel = require('../model/subjectData.model');
const sub_subject = require('../model/subject.model');
const courseCollection = require('../model/Cource.model');
const validateToken = require('../config/auth-token');
const config = require('../config/config');
const mkdirp = require('mkdirp');
const topicModel=require('../model/topic.model');
const studentModel=require('../model/student.model');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        const dir = path.join(__dirname, "../mediafiles/")
        mkdirp(dir, err => callback(err, dir))
    },
    filename: function (req, file, callback) {
        const fileName = req.params.fileName;
        const ext = path.extname(file.originalname);
        const custFileName = fileName + ext;
        callback(null, custFileName);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'video/mp4') {
        callback(null, true);
    } else {
        callback(new Error('please upload PNG/JPEG type files'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


// To upload vedio 
router.post('/savevedio/:fileName', upload.array("memefile"),(req, resp) => {
    console.log("saveVideo",req.body);
    
    if (!req.body) {
        return res.status(400).send("Bad request");
    }
    const myHost = req.hostname;
    const portNumber = config.port;
    const port = process.env.port || portNumber;
    // const fileName = req.body.OwnerId+"_"+req.body.Title;
    const fileName = req.params.fileName;
    console.log('re.files', req.files);
 //   const ext = path.extname(req.file.originalname);
    const memeName = req.files[0].filename;
    const imgName = req.files[1].filename;
    let uniqId = uniqid();
    let model = new subjectModel({
        MemeId: uniqId,
        Meme: memeName,
        gender:req.body.gender,
        OwnerId: req.body.loggedInUser,
        topic_id: req.body.topic_id,
        topic: req.body.topic,
        OwnerName:req.body.userName,
        MemeTitle:req.body.MemeTitle,
        MemeImg:imgName,
    });
    console.log("model add video service",model);
    model.save()
        .then(doc => {
            if (!doc || doc.length === 0) {
                // console.log(moment(doc.CreatedOn).endOf('day').fromNow())
                return resp.status(500).send({
                    message: 'added 500',
                    data: doc
                });
            }
            resp.status(200).send({
                message: 'vedio successfully..!',
                data: doc
            });
        }).catch(error => {
            resp.status(500).send({
                message: 'Error while adding the meme',
                error: error
            });
        });
});

//router.post('/addcource', (req, resp) => {
    router.post('/addcource/:fileName', upload.single("memefile"), (req, resp) => {
    if (!req.body) {
        return res.status(400).send("Bad request");
    }
    const myHost = req.hostname;
    const portNumber = config.port;
    const port = process.env.port || portNumber;
    // const fileName = req.body.OwnerId+"_"+req.body.Title;
    const fileName = req.params.fileName;
    const ext = path.extname(req.file.originalname);
    const memeName = fileName + ext;
    let cource_Id = uniqid();
    let model = new courseCollection({
        course: req.body.course,
        course_id: cource_Id,
        courseImg:memeName
    });
    console.log("model",model);
    model.save()
        .then(doc => {
            if (!doc || doc.length === 0) {
                return resp.status(500).send({
                    message: 'cource added 500',
                    data: doc
                });
            }
            resp.status(200).send({
                message: 'cource added successfully..!',
                data: doc
            });
        }).catch(error => {
            resp.status(500).send({
                message: 'Error while adding the cource',
                error: error
            });
        });
});

router.get('/getvideos', (req, res) => {
    subjectModel.find().then(data => {
        res.status(200).send({
            message: 'uploaded videos',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting videos',
            err: err
        });
    })
});

// To add subject
// router.post('/addsubject',(req, resp)=>{
//      if(!req.body){
//          return res.status(400).send("Bad request");
//      }
//      let model =new sub_subject({
//         discription:req.body.discription,
//         type : req.body.type,
//         sub_type:req.body.sub_type,
//         topics:req.body.topics,
//      });
//      model.save()
//      .then(doc=>{
//          if(!doc || doc.length === 0){
//              return resp.status(500).send({
//                  message : 'subject added 500',
//                  data:doc
//              });
//          }
//          resp.status(200).send({
//              message : 'subject successfully..!',
//              data : doc
//          });
//      }).catch(error=>{
//          resp.status(500).send({
//              message : 'Error while adding the meme',
//              error : error
//          });
//      });
//  });

router.post('/getvideosbytype', (req, res) => {
    sub_subject.find({ Cource: req.body.type }).then(data => {
        res.status(200).send({
            message: 'uploaded videos',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting videos',
            err: err
        });
    })
});

//To get subject details
router.post('/getsubjectdetails', (req, res) => {
    sub_subject.find({ _id: req.body.id }).then(data => {
        res.status(200).send({
            message: 'uploaded videos',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting videos',
            err: err
        });
    })
});


router.post('/getvideosbyselectedtype', (req, res) => {
    
    subjectModel.find({ Cource: req.body.type }).then(data => {
        res.status(200).send({
            message: 'uploaded videos',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting videos',
            err: err
        });
    })
});

router.post('/getvideosUserId', (req, res) => {
  //  subjectModel.find({ OwnerId: req.body.userId }).sort({ CreatedOn: -1 }).then(data => {
    subjectModel.find().sort({ CreatedOn: -1 }).then(data => {
        res.status(200).send({
            message: 'uploaded videos',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting videos',
            err: err
        });
    })
});

//To add cource

// router.post('/addcource', (req, resp) => {
//     if (!req.body) {
//         return res.status(400).send("Bad request");
//     }
//     let cource_Id = uniqid();
//     let model = new courseCollection({
//         course: req.body.course,
//         course_id: cource_Id,
//     });
//     model.save()
//         .then(doc => {
//             if (!doc || doc.length === 0) {
//                 return resp.status(500).send({
//                     message: 'cource added 500',
//                     data: doc
//                 });
//             }
//             resp.status(200).send({
//                 message: 'cource added successfully..!',
//                 data: doc
//             });
//         }).catch(error => {
//             resp.status(500).send({
//                 message: 'Error while adding the cource',
//                 error: error
//             });
//         });
// });

//To get cources 
router.get('/getcources', (req, res) => {
    courseCollection.find().then(data => {
        res.status(200).send({
            message: 'get cources',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting cources',
            err: err
        });
    })
});

router.post('/addsubject/:fileName', upload.single("memefile"), (req, res) => {
    if (!req.body) {
        return res.status(400).send("Bad request");
    }
    const myHost = req.hostname;
    const portNumber = config.port;
    const port = process.env.port || portNumber;
    const fileName = req.params.fileName;
    const ext = path.extname(req.file.originalname);
    const memeName = fileName + ext;
    let subid = uniqid();
    courseCollection.updateOne({ course_id: req.body.course_id }, {
        "$push": {
            subjects: {
                "$each": [{
                    subject: req.body.subject,
                    subject_id: subid,
                    subjectImg:memeName
                }], "$position": 0
            }
        }
    }, function (err, data) {
        if (!err) {
            res.status(200).send({ data: data, message: "data added subject" })
        }
        if (err) {
            res.status(400).send({ error: err, message: " err added subject" })
        }
    })
});

router.get('/getwholedata', () => {
    courseCollection.find().then(cc => { console.log('gftrjytdumy:', cc); });
})


//To get subjectById
router.post('/getsubjectbyid', (req, res) => {
    courseCollection.find({ course_id: req.body.course_id }).then(data => {
        res.status(200).send({
            message: 'get cources',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting cources',
            err: err
        });
    })
});

router.post('/postcomment',(req,res)=>{
    let CommentId = uniqid();
    let model = new subjectModel({
        comments:{
            Comment:req.body.Comment,
            MemeId: req.body.MemeId,
            CommentId:CommentId,
            UserId: req.body.UserId,
            Username: req.body.Username,
            gender:req.body.gender
        }
    });
    
    subjectModel.findOneAndUpdate({MemeId: req.body.MemeId}, {$push: {comments: model.comments}}).then(data=>{
       
    }).catch(err=>{
        
    });
})


//To add topic 

router.post('/addtopic_subject/:fileName', upload.single("memefile"), (req, res) => {
    if (!req.body) {
        return res.status(400).send("Bad request");
    }
    const myHost = req.hostname;
    const portNumber = config.port;
    const port = process.env.port || portNumber;
    const fileName = req.params.fileName;
    const ext = path.extname(req.file.originalname);
    const memeName = fileName + ext;
    let   topicID = uniqid();
    let model = new topicModel({
            topic_id: topicID,
            topic: req.body.topic,
           // subject:req.body.subject,
            topicImg:memeName,
            subject_id:req.body.subject_id,
    });
    model.save().then(data=>{
        res.status(200).send({message:"topic added successfully",data:data});
    }).catch(err=>{
        res.status(400).send({message:"error while adding topic",err:err});
    })
});


//To get subjectById
router.post('/getTopic', (req, res) => {
    topicModel.find({subject_id:req.body.subject_id}).then(data => {
        res.status(200).send({
            message: 'get topics',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting topics',
            err: err
        });
    })
});

router.post('/getvideosbytopic_id', (req, res) => {
    //  subjectModel.find({ OwnerId: req.body.userId }).sort({ CreatedOn: -1 }).then(data => {
      subjectModel.find({topic_id:req.body.topic_id}).sort({ CreatedOn: -1 }).then(data => {
          res.status(200).send({
              message: 'uploaded videos',
              data: data
          });
      }).catch(err => {
          res.status(500).send({
              message: 'Error while getting videos',
              err: err
          });
      })
  });


router.get('/getstudentinfo', (req, res) => {
    studentModel.find().then(data => {
        res.status(200).send({
            message: 'get student',
            data: data
        });
    }).catch(err => {
        res.status(500).send({
            message: 'Error while getting student data',
            err: err
        });
    })
});

module.exports = router;