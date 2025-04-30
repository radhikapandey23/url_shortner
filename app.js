import {createServer} from "http";
import { readFile,writeFile } from "fs/promises";
import path from "path";
// import { json } from "stream/consumers";
// import { write, writeFile } from "fs";

const PORT =3002;
const DATA_FILE = path.join("data","links.json");

const serverFile = async (res,filePath,contentType)=>{
   try{
    const data =await readFile(filePath);
    res.writeHead(200,{"Content-Type" : contentType});
    res.end(data);

   }catch(error){
    res.writeHead(404,{"Content-Type" :contentType});
    res.end('404 Page not Found');
   }
}
const loadLinks = async ()=>{
    try {
        const data = await readFile(DATA_FILE,'utf-8');
        return JSON.parse(data);
        
    } catch (error) {
        if(error.code === "ENOENT"){
            await writeFile(DATA_FILE,JSON.stringify({}));
            // console.log("file created")
            return {};

        }
        throw error;
        
    }
};



const saveLinks = async (links)=>{
    await writeFile(DATA_FILE , JSON.stringify(links));
}

const server = createServer(async (req,res)=>{
 console.log(req.url);
 
    if(req.method ==="GET"){
        if(req.url === "/"){
            return serverFile(res,path.join("public","index.html"),'text/html');

        }
        else if(req.method==="GET"){
            if(req.url ==="/style.css"){
            return serverFile(res,path.join('public', "style.css"),'text/css');
        }else if(req.url === "/links"){
            const links = await loadLinks();

            res.writeHead(200,{"Content-Type": "application/json"});
            return res.end(JSON.stringify(links));
        }
        else{
            const links = await loadLinks();
            const shortcode = req.url.slice(1);
            if(links[shortcode]){
                res.writeHead(302,{location:links[shortcode]});
                return res.end();
            }
        }
        res.writeHead(404 ,{'Content-Type':'text/plain'});
        return res.end("shortened url is not found")
    }
    }

    if(req.method ==="POST" && req.url ==="/shorten"){
        const links = await loadLinks();
        let body = "";
        req.on("data",(chunk)=> (body += chunk));
        req.on("end",async()=>{
            console.log(body);
            const {url,shortcode}=JSON.parse(body);

            if(!url){
                res.writeHead(400,{"Content-Type" : "text/plain"});
                return res.end("URL is require");
            }

            const finalshortcode = shortcode || crypto.randonBytes(4).toString('hex');

            if(links[finalshortcode]){
                res.writeHead(400,{'Content-Type':"text/pain"});
                return res.end("short code is already exits.please another");
            }
            links[finalshortcode]=url;
            await saveLinks(links);

            res.writeHead(200,{"Content-Type": "application/json"});
            res.end(JSON.stringify({success : true ,shortcode :finalshortcode}));

        });
    }

});

server.listen(PORT ,()=>{
    console.log(`server running at http://localhost:${PORT}`);
    
});









