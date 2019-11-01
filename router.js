let express=require('express');
let formidable=require('formidable');
let User=require('./model/user');
let Topic=require('./model/topic');
let Comment=require('./model/comments');
let fs=require('fs');
let router=express.Router();

router.get('/',function (request,response) {
  let judge=request.query.tag;
  if(judge===undefined){
    Topic.findInit(function (data) {
      if(data===0){
        return response.status(500).send({err_code:500,message:'服务端错误'});
      }
      return response.render('index.html',{
        topics:data,
        user:request.session.user
      });
    },null);
  }else{
    Topic.findInit(function (data) {
      if(data===0){
        return response.status(500).send({err_code:500,message:'服务端错误'});
      }
      return response.render('index.html',{
        topics:data,
        user:request.session.user
      });
    },judge);
  }
});     //初始进入的页面

router.use('/topic',function (request,response) {
  let u=request.url.split('/')[1];
  if(request.session.user)
    request.session.user.topicId=u;
  Topic.findTheOne(u,function (data) {
    if(data===0){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }else{
      let user={};
      if(request.session.user){
        user.name=request.session.user.name;
        user.avatar=request.session.user.avatar;
      }
      Comment.findComments(u,function (code) {
        if(code===0){
          return response.status(500).send({err_code:500,message:'服务端错误'});
        }else{
          return response.render('./topic/content.html',{
            content:data,
            comments:code,
            user:user
          });
        }
      });              //加载该文章下的评论
      
    }
  })
});        //加载标题相关的内容

router.get('/login',function (request,response) {
  response.render('login.html');
});      //登陆页面

router.post('/login',function (request,response) {
  let u=request.body;
  User.find(u,function (code,data) {
    if(code===0){
      return response.render('login.html',{
        formValue:u,
        insert:'邮箱或密码错误'
      });
    }else if(code===1){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }else{
      u.name=u.email.split('@')[0];
      u.gender=data.gender;
      u.bio=data.bio;
      u.birthday=data.birthday;
      u.avatar=data.avatar;
      request.session.user=u;
      return response.redirect('/');
    }
  })
});        //通过post对用户提交的登陆信息进行验证

router.get('/register',function (request,response) {
  response.render('register.html');
});       //注册页面

router.post('/register',function (request,response) {
  //1、获取表单数据
  let u=request.body;
  //2、操作数据库（首先查看该用户是否存在，然后才能注册）
  /*User.findOne({
    $or:[           //查看email和nickname之一是否存在
      {Email:u.email},
      {Nickname:u.name}
    ]
  },function (err,data) {
    if(err){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }
    if(data){       //邮箱或昵称已存在
      //return response.status(200).send({err_code:1,message:'邮箱或昵称已存在'});
      return response.render('register.html',{
        formValue:u,
        insert:'邮箱或昵称已存在'
      });
    }
    //response.status(200).send({err_code:0,message:'注册成功'});
  
    //注册成功，使用session来记录用户的登陆状态
    request.session.user=u;
    
    u.password=md5(md5(u.password));
  });*/
  User.add(u,function (code) {
    if(code===0){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }
    if(code===1){
      return response.render('register.html',{
        formValue:u,
        insert:'邮箱或昵称已存在'
      });
    }
    request.session.user=u;
    //3、发送响应
    return response.redirect('/');
  })
  
});      //通过post对用户提交的信息进行验证

router.get('/modify',function (request,response) {
  response.render('modify.html',{
    user:request.session.user
  });
});          //修改信息页面

router.post('/modify',function (request,response) {
  let form = new formidable.IncomingForm();
  form.uploadDir = "./public/img";
  //保留上传文件的后缀名
  form.keepExtensions = true;
  form.type='multipart';
  form.parse(request, function(err, fields, files) {
    if(err){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }
    let u={};
    for(let key in fields){
      u[key]=fields[key];
    }
    
    fs.rename(files.avatar.path,'public/img/'+fields.nickname+'.'+files.avatar.path.split('.')[1],function (err) {
      if(err)
      return console.log(err);
    });
  
    u.avatar='public/img/'+fields.nickname+'.'+files.avatar.path.split('.')[1];
    User.modify(u,function (code) {
      if(code===0){
        return response.status(500).send({err_code:500,message:'服务端错误'});
      }
      request.session.user.gender=u.sex;
      request.session.user.birthday=u.birthday;
      request.session.user.bio=u.bio;
      request.session.user.avatar=u.avatar;
      Topic.modifyAvatar(fields.nickname,u.avatar,function (code) {
        if(code===0){
          return response.status(500).send({err_code:500,message:'服务端错误'});
        }
        return response.redirect('/');
      });
    });
    
  });
  /*let u=request.body;
  User.modify(u,function (code) {
    if(code===0){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }
    request.session.user.gender=u.sex;
    request.session.user.birthday=u.birthday;
    request.session.user.bio=u.bio;
    return response.redirect('/');
  })*/
});           //通过post上传修改信息

router.use('/user',function (request,response) {
  let u=request.url.split('/')[1];
  User.getInfo(u,function (code) {
    if(code===0){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }else{
      Topic.findTheUser(u,function (code1) {
        if(code1===0){
          return response.status(500).send({err_code:500,message:'服务端错误'});
        }else{
          response.render('userInfo.html',{
            tuser:code,
            topics:code1,
            user:request.session.user
          });
        }
      });
    }
  });
});           //用户信息界面

router.get('/sentMessage',function (request,response) {
  response.render('./topic/sentMessage.html',{
    user:request.session.user
  });
});          //发表内容页面

router.post('/sentMessage',function (request,response) {
  let c={};
  c.user=request.session.user.name;
  c.avatar=request.session.user.avatar;
  c.type=request.body.type;
  c.topic=request.body.topic;
  c.content=request.body.content;
  Topic.add(c,function (code) {
    if(code===0){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }
    if(code===1){
      return response.render('./topic/sentMessage.html',{
        mes:'您对于这一类型发表的这篇文章已存在！'
      })
    }
    if(code===2){
      return response.redirect('/');
    }
  })
});             //提交内容

router.post('/sentComment',function (request,response) {
  let c={};
  c.user=request.session.user.name;
  c.avatar=request.session.user.avatar;
  c.content=request.body.comment;
  c.link=request.session.user.topicId;
  Comment.add(c,function (code) {
    if(code===0){
      return response.status(500).send({err_code:500,message:'服务端错误'});
    }else{
      return response.redirect('/topic/'+request.session.user.topicId);
    }
  });
});          //保存用户发表的评论

router.get('/logout',function (request,response) {
  //清除登录状态
  request.session.user=null;
  //重定向
  response.redirect('/');
});        //退出登录状态

module.exports=router;
