let express=require('express');
let path=require('path');
let router=require('./router');
let bodyParser=require('body-parser');
let session = require('express-session');

let app=express();

app.use('/public',express.static(path.join(__dirname,'public')));
app.use('/node_modules/',express.static(path.join(__dirname,'node_modules')));

//在node中有很多第三方模板引擎可以使用，并不是只有art-template
app.engine('html', require('express-art-template'));

//配置表单请求体插件需要在router之前
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//配置session
app.use(session({
  secret: 'keyboard cat',     //表示加密字符串，类似于u.password=md5(md5(u.password)+'keyboard cat');在原有加密基础上提高安全性
  resave: false,
  saveUninitialized: true    //无论是否使用session，默认直接分配一把钥匙，设置为false时表示只有设置session时才会给钥匙，删去cookie后不给
}))
app.use(router);

//配置404 错误的中间件，写在router后面是因为当前面router路由中没有任何能处理的中间件时就能进入下面的代码
//若放在router前面则什么请求都会进入404
app.use(function (request,response) {
  response.render('./_layout/404.html');
})

//配置全局错误处理（比如在router中数据库的err）中间件。。。不想写了

app.listen(3000,function () {
  console.log('app is running at 3000...');
})
