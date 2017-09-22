	var can,ctx;
	var isWhite = {party:null,turn:false};//是否轮到白棋,以及是否为白方
	var  imgb = new Image();
	imgb.src = 'img/black.png';
	var imgw = new Image();
	imgw.src = 'img/white.png';
	//自适应屏幕大小
	var canWidth = Math.min(640,$(window).width() - 20);
	var canHeight = canWidth;
	var body = document.documentElement||document.body;
	//聊天窗口高度为，屏幕高度减去画布高度，再减去顶部高度
	$('#chat').css({
		'width':canWidth,
		'height':body.clientHeight-canHeight-46
	})
	$('.form').css({'height':32});
	$('#messages').css({'height':body.clientHeight-canHeight-78});

	
	//定义所有棋盘可以点的位置的初始值都为0，1为黑，22为白
	var a = new Array(15);//15个元素的数组，
	for(var x=0;x<a.length;x++){
		a[x] = new Array(15);//a里面的每一项都是一个数组
		for(y=0;y<a[x].length;y++){
			a[x][y] = 0;
		}
	}
	//人数不够，或者游戏结束的重置棋盘
	function Reset(){
        ctx.clearRect(0,0,can.width,can.height);
		window.drawRect();
		for(var x=0;x<a.length;x++){
			for(y=0;y<a[x].length;y++){
				a[x][y] = 0;
			}
		}		
	}
	//定义方法。画棋盘
		~function drawRect(){	
				can = document.getElementById('canvas');
				ctx = can.getContext('2d');
				can.width = canWidth;
				can.height = canHeight;
					for(var i=0;i<=canWidth;i += canWidth/16){
						ctx.beginPath();
						ctx.moveTo(0,i);
						ctx.lineTo(canWidth,i);
						ctx.closePath();
						ctx.stroke();						
						ctx.beginPath();
						ctx.moveTo(i,0);
						ctx.lineTo(i,canWidth);
						ctx.closePath();
						ctx.stroke();
					}
				window.drawRect = drawRect;
			}()
		//画布点击事件
		function play(e){
			e.preventDefault();
			var x = parseInt((e.offsetX - canWidth/32)/(canWidth/16));
			var y = parseInt((e.offsetY - canWidth/32)/(canWidth/16));	
			var X = e.offsetX;
			var Y = e.offsetY;
			socket.emit('play',{x,y,X,Y})
		}
		//根据点击位置画棋子
		function drawChess(chess,x,y){
			if(x>=0&&x<15&&y>=0&&y<15){
				if(chess == 1){
					ctx.drawImage(imgw,x*(canWidth/16)+(canWidth/32),y*(canWidth/16)+(canWidth/32),(canWidth/16),(canWidth/16));
					a[x][y] =1;
				}else{
					ctx.drawImage(imgb,x*(canWidth/16)+(canWidth/32),y*(canWidth/16)+(canWidth/32),(canWidth/16),(canWidth/16));
					a[x][y]=2;
					isWhite.turn = true;
				}
				judge(x,y,chess)
			}
		}
		//判断游戏状态
		function judge(x,y,chess){
			var count1 = count2 = count3 =count4 = 0;
			//左右判断
			for(var i=x-1;i>=0;i--){
				if(a[i][y]!=chess){
					break;
				}
				count1++;
			};
			for(var i=x;i<15;i++){
				if(a[i][y]!=chess){
					break;
				}
				count1++;
			}
			//上下判断
			for(var i=y-1;i>=0;i--){
				if(a[x][i]!=chess){
					break;
				}
				count2 ++;
			}
			for(var i=y;i<15;i++){
				if(a[x][i]!=chess){
					break;
				}
				count2 ++;
			}
			//左上右下 判断
			for(var i=x,j=y;i>0&&j>0;i--,j--){
				if(a[i][j]!=chess){
					break;
				}
				count3++;
			}
			for(var i=x+1,j=y+1;i<15&&j<15;i++,j++){
				if(a[i][j]!=chess){
					break;
				}
				count3++;
			}
			//左下右上判断
			for(var i=x,j=y;i>=0&&j<15;i--,j++){
			
				if(a[i][j]!=chess){
					break;
				}
				count4++;
			}
			for(var i=x+1,j=y-1;i<15&&j>=0;i++,j--){
				
				if(a[i][j]!=chess){
					break;
				}
				count4++;
			}	
			
            if (count1 >= 5 || count2 >= 5 || count3 >= 5 || count4 >= 5) {
                if (chess == 1) {
                    alert("白棋赢了");
                }
                else {
                    alert("黑棋赢了");
                }
				Reset();
            }
		}
		//注册请求		
			$('#Reg').click(function(){
				$.ajax({
					type:"post",
					url:"/user",
					async:true,
					data:{act:'Reg',user:$('#userTxt').val(),pass:$('#passTxt').val()},
					success:function(data){
						data = JSON.parse(data);
						alert(data.msg);
						if(data.ok == true){
							location.reload();
						}else{
							$('#userTxt').focus().select();
						}
					}
				});
			})
			//登录请求
			function Login(){
				$.ajax({
					type:"post",
					url:"/user",
					async:true,
					data:{act:'login',user:$('#userTxt').val(),pass:$('#passTxt').val()},
					success:function(data){
						data = JSON.parse(data);
						alert(data.msg);
						if(data.ok == true){							
							setUsername($('#userTxt').val())
						}else{
							$('#userTxt').focus().select();
						}
					}
				});
			}
			//声明变量,用于socket实时通讯
		 		var socket = io();
		 		var lastTypingTime;
		 		var username;		 		
		 		var $mask = $('#myModal');
		 		var $inputMessage = $('#inputMessage');
		 		var $inputName = $('#inputName');
		 		var $currentInput=$('#user').focus();//当前光标位置		 	
	 		  	var COLORS = [
			    '#e21400', '#91580f', '#f8a700', '#f78b00',
			    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
			    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
			 	 ];
			 	//登录之后执行
		 		function setUsername (data){
		 			username = data;
		 			if(username){
		 				$mask.removeClass('show');
		 				$currentInput = $('#inputMessage').focus();
		 				//给后台发数据;
		 				socket.emit('add user',username);
		 			}
		 		}
		 		//发送消息
			 	function sendMessage(){
			 		var message = $inputMessage.val();
			 		message = cleanInput(message);
			 		if(message){
			 			$inputMessage.val('');
			 			socket.emit('new message',message);
			 		}
			 	}
			 	//选择棋子发送给后台
			 	document.getElementById('choose').addEventListener('click',function(e){
			 		var chessColor = e.target.parentNode.id;
			 		console.log(chessColor);
			 		if(chessColor =='white'||chessColor =='black'){
			 			socket.emit('chessColor',chessColor);
			 			$('#choose .modal').removeClass('show');
			 		}
			 	})
			 	//获取前台chessColor发送给后台，之后后台返回过来的值
			 	socket.on('chessColor',function(data){
			 			$('#choose .modal').find('#'+data).remove();
			 	})
			 	//登录完成
			 	socket.on('add user',function(msg){
			 		alert(msg)//暂未执行，后台未返回
				})
			 	//发送消息
			  	socket.on('new message',function(msg){
			 			addChatMessage(msg);
				})
			  	//获取登录信息，做出判断，
			 	socket.on('login',function(msg){
			 		console.log(msg.numUsers,msg.userJoined);
			 		if(msg.numUsers>2){
			 			alert('已经满员了,您只能观战')
//			 			location.reload();
			 		}else if(msg.numUsers==2){
			 			socket.emit('chooseDialog');
			 		}			 		
			 	})
			 	socket.on('userJoined',function(data){
			 		userJoined(data);
			 	})
			 	//玩家达到2人，选子对话框弹出；
			 	socket.on('chooseDialog',function(str){
			 		$('#choose').html(str);
			 	})
			 	//玩家离开提示，并重置棋盘
			 	socket.on('disconnect',function(data){
			 		userLeaved(data.userLeave);
			 		if(data.PlayerNum<=1){Reset();}
			 		
			 	})
			 	//获取后台发送过来的账号异地登录；
			 	socket.on('relogin',function(){
			 		alert('您的账号已经在别的地方登陆')
			 		location.reload();
			 	})
			 	//接收点击事件;
			 	socket.on('play',function(data){
					//先判断是否人齐;
					if(data.numUsers<2){
						alert('请等待其他玩家加入');
						return;
					}
					if(data.color == 'white'){
						if(isWhite.turn){
							isWhite.party = 1;
							isWhite.turn = false;
							console.log(isWhite)								
						}else{
//							alert('别人黑子还没下呢，猴急啥。')
							return;
						}
					}else if(data.color == 'black'){
						if(isWhite.turn){
//							alert('别人老白还没下呢。等等');
							return;
						}else{
							isWhite.party = 2;
							console.log(isWhite)								
						}
					}else{
						return;
					}
					if(data.data.X>620||data.data.Y>620){
						console.log('您点出界了')
						return;
					}
					if(a[data.data.x][data.data.y] !=0){
						console.log('这里已经有人下了')
						return;
					}
					drawChess(isWhite.party,data.data.x,data.data.y)			 		
			 	})
			 	//自定义创建元素绑定的函数
			 	function addChatMessage(data){
			 		var chatName = $('<span class="chatName"/>');
			 		var messageBody = $('<span class="messageBody"/>');
			 		chatName.text(data.username).css('color',getUsernameColor(data.username));
			 		messageBody.text(data.message).css('color',getUsernameColor(data.username));
			 		var oLi = $('<li  />').append(chatName,messageBody);
			 		$('#messages ul').append(oLi);
			 		new iScroll('messages').scrollTo(0,-$('#messages ul').height(),0);
			 	}
			 	//自定义创建玩家加入提示
			 	function userJoined(data){
			 		var userJoined = $('<span class="userJoined" />').text('玩家'+' '+data+' '+'加入房间');
			 		var oLi = $('<li />').append(userJoined);
			 		$('#messages ul').append(oLi);
			 	}
			 	//自定义玩家退出提示
			 	function userLeaved(data){
			 		var userJoined = $('<span class="userJoined" />').text('玩家'+' '+data+' '+'离开房间');
			 		var oLi = $('<li />').append(userJoined);
			 		$('#messages ul').append(oLi);
			 	}			 	
			 	//获取随机的一个颜色值
			 	function getUsernameColor (username) {
				    var hash = 7;
				    for (var i = 0; i < username.length; i++) {
				       hash = username.charCodeAt(i) + (hash << 5) - hash;
				    }
				    var index = Math.abs(hash % COLORS.length);
				    return COLORS[index];
				}
			 	function cleanInput (input) {
				    return $('<div/>').text(input).html();
				}
			 	//判断键盘事件
			  $(window).keydown(function (event) {
			    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
			      $currentInput.focus();
			    }
				   if(event.which ===116){
				   	return false;
				   }
			    if (event.which === 13) {
					if(username){
						sendMessage();
					}else{
						Login();
					}
			     }
			  });
			  //发送消息
			  $('#send').click(function(){
			  	sendMessage();
			  })
			  //登录账号
			   $('#login').click(function(){
			  	Login();
			  })
			//第三方的登录，qq登录
//			~function(){
//				QC.Login({
//					btnId:'qq'
//				});
//				QC.Login.showPopup({
//					appId:'qq',
//					rUri:'http://localhost:8181/index.html'
//				});
//				QC.Login.getMe(function(openID,accessToken){
//					console.log(openID)
//				})
//			}()
