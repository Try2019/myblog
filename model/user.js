let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let md5=require('blueimp-md5');

mongoose.connect('mongodb://localhost/blog',{useNewUrlParser: true, useUnifiedTopology: true});

let userSchema=new Schema({
  Email:{type:String,required:true},
  Nickname:{type:String,required:true},
  Password:{type:String,required:true},
  created_time:{
    type:Date,           //不能写成Date.now()，因为写成括号会将这个时间写死，每次插入数据都是这个时间
    default:Date.now    //当new一个model时，如果没有传递createtime，则mongoose就会调用default指定的方法，使用其返回值作为默认值
  },
  last_modified_time:{
    type:Date,
    default:Date.now
  },
  avatar:{            //头像
    type:String,
    default:'public/img/avatar-default.png'
  },
  bio:{              //简介
    type:String,
    default:''
  },
  gender:{
    type:Number,
    enum:[0,1,-1],
    default:-1
  },
  birthday:{
    type:String,
    default:''
  },
  status:{
    type:Number,       //是否可以评论，是否可以登录
    enum:[0,1,2],
    default:0           //没有权限限制，1表不能评论，2表不能登录
  }
});

let User=mongoose.model('User',userSchema);

User.add=function (u,callback) {
  User.findOne({
    $or:[           //查看email和nickname之一是否存在
      {Email:u.email},
      {Nickname:u.name}
    ]
  },function (err,data) {
    if(err){         //服务端错误
      return callback(0);
    }
    if(data){       //邮箱或昵称已存在
      return callback(1);
    }
    //注册成功
    u.password=md5(md5(u.password));
    let user=new User({Email:u.email,Nickname:u.name,Password:u.password});
    user.save(function (err,ret) {
      if(err){
        return callback(0);
      }else{
        return callback(2);
      }
    })
  });
}         //添加注册用户

User.find=function (u,callback) {
  User.findOne({
    "Email":u.email,
    "Password":md5(md5(u.password))
  },function (err,data) {
    if(err){
      return callback(1,null);
    }
    if(data){
      let temp={};
      temp.gender=data.gender;
      temp.bio=data.bio;
      temp.birthday=data.birthday;
      temp.avatar=data.avatar;
      return callback(2,temp);
    }
    return callback(0,null);
  })
}        //验证登陆信息

User.modify=function (u,callback) {
  User.updateOne({Nickname:u.nickname},{gender:u.sex,birthday:u.birthday,bio:u.bio,last_modified_time:new Date().toISOString(),avatar:u.avatar},function (err) {
    if(err){
      return callback(0);
    }
    return callback(1);
  })
}         //修改用户信息

User.getInfo=function (u,callback) {
  User.findOne({"Nickname":u},function (err,data) {
    if(err){
      return callback(0);
    }
    if(data){
      let user={};
      user.name=data.Nickname;
      user.Email=data.Email;
      user.avatar=data.avatar;
      user.gender=data.gender;
      user.createTime=data.created_time;
      user.bio=data.bio;
      callback(user);
    }
  });
}         //匹配用户信息页面

module.exports=User;
