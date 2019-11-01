let mongoose=require('mongoose');
let Schema=mongoose.Schema;

mongoose.connect('mongodb://localhost/blog',{useNewUrlParser: true, useUnifiedTopology: true});

let commentSchema=new Schema({
  Link:{type:String,required:true},
  User:{type:String,required:true},
  avatar:{type:String,required:true},
  CreateTime:{type:Date,default:Date.now},
  Comment:{type:String}
});

let Comment=mongoose.model('Comment',commentSchema);

Comment.add=function (c,callback) {
  let comment=new Comment({Link:c.link,User:c.user,avatar:c.avatar,Comment:c.content});
  comment.save(function (err,data) {
    if(err){
      return callback(0);
    }
    return callback(1);
  })
}      //添加评论

Comment.findComments=function (id,callback) {
  Comment.find({Link:id},function (err,data) {
    if(err){
      return callback(0);
    }else{
      if(data.length===0){
        return callback(null);
      }
      else
        return callback(data);
    }
  }).sort({'CreateTime':-1});
}

module.exports=Comment;
