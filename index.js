let express = require('express');
const ChromeLauncher = require('chrome-launcher');
let app = express();
let router = require('./router/main')(app);
let port = 3000;
// var fileUploadRouter = require('./router/upload');


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

app.use('/upload', express.static('upload'));




app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

let server = app.listen(port, function(){
    console.log("Express server has started on port "+ port)
});
