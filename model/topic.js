let mongoose=require('mongoose');
let Schema=mongoose.Schema;

mongoose.connect('mongodb://localhost/blog',{useNewUrlParser: true, useUnifiedTopology: true});

let topicSchema=new Schema({
  User:{type:String,required:true},
  Topic:{type:String,required:true},
  Content:{type:String,default:'The guy says nothing...'},
  Type:{type:String,enum:['share','qanda','employ','test'],default:'share'},
  Click:{type:Number,default:0},
  CreateTime:{type:Date,default:Date.now},
  ModifyTime:{type:Date,default:Date.now},
  avatar:{type:String,default:'/public/img/avatar-default.png'}
});

let Topic=mongoose.model('Topic',topicSchema);

Topic.add=function (c,callback) {
  Topic.findOne({User:c.user,Topic:c.topic,Type:c.type},function (err,data) {
    if(err){
      return callback(0);
    }
    if(data){
      return callback(1);
    }
    let topic=new Topic({User:c.user,Topic:c.topic,Content:c.content,Type:c.type,avatar:c.avatar});
    topic.save(function (err,data) {
      if(err){
        return callback(0);
      }
      return callback(2);
    })
  })
}              //添加新的发表内容

Topic.findInit=function (callback,type) {
  if(type===null||type==='all'){
    Topic.find({},function (err,data) {
      if(err){
        return callback(0);
      }
      if(data){
        return callback(data);
      }
    }).limit(15).sort({'ModifyTime':-1});  //查询15条内容，并且按照修改时间升序排序
  }else if(type==='mostClick'){
    Topic.find({Click : {$gte : 10}},function (err,data) {
      if(err){
        return callback(0);
      }
      if(data){
        return callback(data);
      }                             //使用.skip(page * 5) 进行分页查询
    }).limit(15).sort({'ModifyTime':-1});
  }else{
    Topic.find({Type:type},function (err,data) {
      if(err){
        return callback(0);
      }
      if(data){
        return callback(data);
      }
    }).limit(15).sort({'ModifyTime':-1});
  }
}          //进入首页时渲染内容

Topic.findTheOne=function (id,callback) {
  Topic.findOne({_id:id},function (err,data) {
    if(err){
      return callback(0);
    }
    if(data){
      let c=data.Click+1;
      Topic.updateOne({_id:id},{Click:c},function (err) {
        if(err){
          return callback(0);
        }
      })
      return callback(data);
    }
  })
}          //加载标题对应的数据

Topic.findTheUser=function (u,callback) {
  Topic.find({"User":u},function (err,data) {
    if(err){
      return callback(0);
    }else{
      return callback(data);
    }
  }).limit(5).sort({'ModifyTime':-1});
}           //找到用户最近5次发表的评论

Topic.modifyAvatar=function (name,avatar,callback) {
    Topic.updateOne({'User':name},{'avatar':avatar},function (err) {
      if(err){
        return callback(0);
      }
      return callback(null);
    });
}              //当用户头像修改后修改页面评论上的头像

module.exports=Topic;
