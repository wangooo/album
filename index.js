var http= require ("http");
var ejs= require ("ejs");
var fs= require ("fs");
var path = require ("path");
var url = require ("url");
var formidable = require ("formidable");
var util = require ("util");
var sl = require ("silly-datetime");

var server=http.createServer(function(req,res){
    var thepathname=url.parse(req.url).pathname;
    if(req.url.indexOf('.')==-1 && req.url!='/dopost'){
        thepathname+='index.html';
    }
    if(thepathname=='/dopost'&&req.method.toLowerCase()=='post'){
        var form=new formidable.IncomingForm();
        form.uploadDir = "./static/albumlist/";
        form.parse(req,function(err,fields,files){
            if(err){throw err};
            var al_num=fields.album;
            console.log(util.inspect({fields:fields,files:files}));
            var alb_num=fields.album;
            var ttt=sl.format(new Date(),'YYYYMMDDHHmm');
            var ext=path.extname(files.upload.name);
            var oldpath=__dirname+'/'+files.upload.path;
            var newpath=__dirname+'/'+'static/albumlist/'+alb_num+'/'+ttt+ext;
            fs.rename(oldpath,newpath,function(){
                res.writeHead(200,{"Content-type":"text/html;charset=UTF-8"});
                res.end("success");
            })
            res.end("上传成功！");
        })
    }
    fs.readFile('./static'+thepathname,function(err,data){
        if(err){
            fs.readFile('./static/404.html',function(err,data){
                res.writeHead(200,{"Content-type":"text/html;charset=UTF-8"});
                res.end(data);
            })
            return;
        }
        console.log(thepathname);
        if(thepathname=='/index.html'){
            var template=data.toString();
            fs.readdir('./static/albumlist',function(err,files) {
                if (err) {
                    throw err;
                    return;
                }
                var mAs = [];
                for (var i = 0; i < files.length; i++) {
                    mAs.push(files[i]);
                }
                var myAlbums = mAs.slice(1);
                // console.log(myAlbums);
                var dictionary = {
                    myAlbums: myAlbums
                };
                var html = ejs.render(template, dictionary);

                res.writeHead(200, {"Content-type": "text/html;charset=UTF-8"});
                res.end(html);
            })
        }
        if(thepathname=='/pics.html'){
            var template2=data.toString();
            var arg = url.parse(req.url, true).query;
            var idd=arg.id;//方法二arg => { aa: '001', bb: '002' }
            console.log(arg.id);
            fs.readdir('./static/albumlist/album'+idd,function(err,files) {
                if (err) {
                    throw err;
                    return;
                }
                var mAs2 = [];

                for (var j = 0; j < files.length; j++) {
                    mAs2.push(files[j]);
                }
                var myAlbums2 = mAs2.slice(1);

                console.log(myAlbums2);
                var dictionary2 = {
                    myAlbums2: myAlbums2,
                    idd:idd
                };
                var html2 = ejs.render(template2, dictionary2);

                res.writeHead(200, {"Content-type": "text/html;charset=UTF-8"});
                res.end(html2);
            })
        }
        var exn = path.extname(thepathname);

        getMime(exn,function(mime){
            res.writeHead(200,{"Content-type":mime});
            res.end(data);
        })
    });

});

function getMime(exn,callback){
    fs.readFile('./static/mime.json',function(err,data){
        if(err){
            throw err;
            return;
        }
        var mimeJSON=JSON.parse(data);
        var mime=mimeJSON[exn]||'text/plain';

        callback(mime);
    })
}


server.listen(3100,"localhost");