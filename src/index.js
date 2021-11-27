const cors = require("cors");
const express = require("express");
const app = express();
// const URLs = "https://tinnys.herokuapp.com/u/";
const URLs="http://localhost:3002/u/";
// const URLs2 = "https://tinnys.herokuapp.com";
const URLs2="http://localhost:3002";
app.use(cors({
    origin:"http://localhost:3001",
    credentials:true,
}));
app.use(express.json());
const mongoose = require("mongoose");
const conn_url =
   "mongodb+srv://sontinagina:sontinagina@tiny-cluster.rfz2z.mongodb.net/Tiny-URLs?retryWrites=true&w=majority";
const db = mongoose.createConnection(conn_url, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});
const userSchema = new mongoose.Schema({
   url: String,
   newUrl: String,
   hashcode: String,
   createdDateTime: String,
});
const user = db.model("Users", userSchema);
const crypto = require("crypto");
const randomValueHex1 = function (len) {
   return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString("hex") // convert to hexadecimal format
      .slice(0, len)
      .toUpperCase(); // return required number of characters
};
const randomValueHex2 = function (len) {
   return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString("hex") // convert to hexadecimal format
      .slice(0, len)
      .toLowerCase(); // return required number of characters
};
const generateUniqueKey = function () {
   const str = randomValueHex2(4) + "-" + randomValueHex1(4);
   console.log(str);
   return str;
};
app.post("/getUrl", async (req, res) => {
   const { url } = req.body;
   if (url === undefined || url === null) {
      res.send({ url: "Invalid url" });
   } else {
      const curr_url = await user.find(
         {
            url,
         },
         { newUrl: 1, _id: 0 }
      );
      if (curr_url[0] !== null && curr_url[0] != undefined) {
         res.send({ url: curr_url[0].newUrl });
      } else {
         let hashcode = null;
         let isUnique = false;
         while (!isUnique) {
            hashcode = await generateUniqueKey();
            const curr_hashcode = await user.find(
               {
                  hashcode,
               },
               { _id: 1 }
            );
            console.log(curr_hashcode);
            if (
               curr_hashcode[0] === null ||
               curr_hashcode[0] === undefined ||
               curr_hashcode[0] === "" ||
               curr_hashcode[0] == []
            ) {
               isUnique = true;
               break;
            }
         }
         // let newGenUrl=req.protocol+"://"+req.hostname+":"+3000+"/"+hashcode;
         let newGenUrl = URLs + hashcode;
         console.log("new gen url:: ", newGenUrl);
         const newUser = new user({
            url,
            newUrl: newGenUrl,
            hashcode: hashcode,
            createdDateTime: new Date().toLocaleString(),
         });
         await newUser.save();
         res.send({ url: newGenUrl });
      }
   }
});

app.get("*/u/*", async (req, res) => {
   console.log("server is heated");
   const newUrl = URLs2 + req.originalUrl;
   console.log(req.originalUrl);

   if (req.originalUrl === undefined || req.originalUrl === null) {
      res.send({ url: "Invalid url" });
   } else {
      const curr_url = await user.find(
         {
            newUrl,
         },
         { url: 1, _id: 0 }
      );
      if (curr_url[0] !== null && curr_url[0] != undefined) {
         console.log(curr_url);
         res.writeHead(301, { Location: curr_url[0].url });
         res.end();
      } else {
         res.send({ url: "not found" });
      }
      // res.send("server is working fine");
   }
});



 app.listen(process.env.PORT || 3002);
//  app.listen(3000,()=>{
//      console.log("server started.........");
//  });
