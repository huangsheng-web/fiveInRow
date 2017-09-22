var querystring = require('querystring');
var io = require('socket.io')(http);
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
var fs = require('fs');
app.use('/',function(req,res){
	
	var objUrl = url.parse(req.url,true);
	var pathname = objUrl.pathname;
	var GET = objUrl.query;
	
	var reg = /\.(HTML|JS|CSS|JSON|JPG|PNG)/i;
	if(reg.test(pathname)){

	var suffix = reg.exec(pathname)[1].toUpperCase();
		
	var suffixMIME = "";
		switch(suffix){
		case "HTML":
		suffixMIME = "text/html;charset=utf-8;";
		break;
		case "CSS":
		suffixMIME = "text/css;charset=utf-8;";
		break;
		case "JS":
		suffixMIME = "text/javascript;charset=utf-8;";
		break;
		case "JSON":
		suffixMIME = "application/json;charset=utf-8;";
		break;
		case "JPG":
		suffixMIME = "image/jpeg";
		break;
		case "PNG":
		suffixMIME = "image/png";
		break;		
		}
		
	var file_name ='.'+req.url;
	fs.readFile(file_name,function(err,data){
		if(err){
			res.write('404')
		}else{
			res.writeHead(200,{'content-type': suffixMIME})	
			res.write(data);
		}
		res.end();
	});
	}
	var con = '';
	var	result={};
	var	userPath = './data/data.json';
	var str = '';
		//首先把custorm.json里的所有数据获取到；
		con = fs.readFileSync(userPath,"utf-8");
		con.length === 0 ?con = '{}':null;
		con = JSON.parse(con);
		//登录注册api
	if(pathname == '/user'){
		req.on('data',function(chunk){
			str += chunk;
		});
		req.on('end',function(){
			var POST = querystring.parse(str);
			switch (POST.act){
				case 'Reg':
					if(POST.user==''||POST.pass ==''){
						res.write('{"ok":false,"msg":"注册失败，填写不完整"}')
					}else if(con[POST.user] == null){
						con[POST.user] = POST.pass;
						fs.writeFileSync(userPath,JSON.stringify(con),'utf-8');
						res.write('{"ok":true,"msg":"注册成功"}')
					}else{
						res.write('{"ok":false,"msg":"该用户名已经被注册了"}')
					}
					break;
				case 'login':
					if(con[POST.user]==null){
			           res.write('{"ok":false,"msg":"用户名不存在"}')
			        }else if(con[POST.user]!=POST.pass){
			           res.write('{"ok":false,"msg":"用户名或密码不对"}')
			        }else{
			           res.write('{"ok":true,"msg":"登录成功"}');
			        }
			        break;
			        default:
			       	 res.write('小主不知道您想干嘛')						
				}
				res.end();
			})
		}
	})
	var numUsers = 0;
	var userJoined = '';
	var users =[];
	var c = ['black','white'];
	var PlayerNum = null;
	io.on('connection',function(socket){
		if(users.length>2){
			return;
		}else{
		socket.on('add user',function(username){
			for(var i=0;i<users.length;i++){
				if(users[i]===username){
					numUsers = numUsers
					socket.emit('relogin')
					return;
				}
			}
			users.push(username);
			++numUsers;
			console.log(users);
			socket.username = username;
			socket.emit('login',{
				numUsers:numUsers,
				userJoined : username
			})
			io.emit('userJoined',username);
			//接收点击事件，然后返回
			socket.on('play',function(data){
				io.emit('play',{
					data:data,
					color:socket.color,
					numUsers:numUsers
				})
			})	
			//获取到前台发过来的选择的颜色;
			socket.on('chessColor',function(color){
				socket.color = color;
				io.emit('chessColor',color)
			})
			socket.on('disconnect', function () {
			for(var i=0;i<users.length;i++){
				if(users[i] == username){
						users.splice(i,username);
						users.length--;
						PlayerNum = i;
						console.log(i)
						break;
					}
				}
				console.log(users);
		     	--numUsers;
		     	io.emit('disconnect',{
					PlayerNum:PlayerNum,
					userLeave : username		     		
		     	})
		  	})			
		})	
		//定义一个方法，处理选择的颜色
	}
		//接收聊天信息，然后返回
	socket.on('new message',function(data){
		io.emit('new message',{
			username:socket.username,
			message:data
		})
	})
	//人满之后返回给客户端选择棋子弹出框
	socket.on('chooseDialog',function(){
		var str = `<div class="modal show">
					<div class="modal-dialog">
						<div class="modal-content">
							<div class="modal-header">
								<h4 class="modal-title text-center">请选择棋子,黑子先下,棋局结束之后由败方先下.</h4>
							</div>
							<div class="modal-body text-center">
								<button id="white" class="btn btn-default "><img src="img/white.png"  width="100%" height="100%"/></button>
								<button id="black" class="btn btn-primary"><img src="img/black.png"  width="100%" height="100%"/></button>
							</div>
						</div>
					</div>					
				</div>`
		io.emit('chooseDialog',str)
	})


})

http.listen(8181)
