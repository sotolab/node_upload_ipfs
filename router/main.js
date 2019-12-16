
const multer = require("multer");
const path = require("path");
const ipfs = require("ipfs");
const fs = require('fs');

const FileReader = require('filereader')
    , fileReader = new FileReader()

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "upload/")
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + "-" + Date.now() + extension);
    }
});

// 1. 미들웨어 등록
let upload = multer({
    storage: storage
});


module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index.html')
    });
    app.get('/about', function (req, res) {
        res.render('about.html');
    });

    // 뷰 페이지 경로
    app.get('/show', function (req, res, next) {
        res.render("board")
    });

    async function uploadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)

            reader.onloadend = () => {
                const buffer = Buffer.from(reader.result)
                ipfs.add(buffer)
                    .then(files => {
                        resolve(files)
                    })
                    .catch(error => reject(error))
            }

        })
    }

    // 2. 파일 업로드 처리
    app.post('/upload/create', upload.single("imgFile"), async function (req, res, next) {
        // 3. 파일 객체
        let file = req.file;
        console.log("file: ", file)

        let hash = ''


        //Reading file from computer
        try {
            let testFile = fs.readFileSync(file.path);
            //Creating buffer for ipfs function to add file to the system
            // let testBuffer = new Buffer(testFile);
            // const files = await uploadFile(file.path)
            // const multihash = files[0].hash

            let node = await ipfs.create({ silent: true })
            let filesAdded = await node.add({
                path: 'hello.txt',
                content: Buffer.from(testFile)
            })
            let fileBuffer = await node.cat(filesAdded[0].hash)

            hash = filesAdded[0].hash;

            console.log('https://ipfs.io/ipfs/' + filesAdded[0].hash)
        }

        catch (exception) {
            console.log(exception);
        }
        // console.log('Added file contents:', fileBuffer.toString())

        // console.log('Added file contents:', filesAdded[0].hash)



        // let fileBuffer = Buffer.from(file);

        // const reader = new FileReader(); 
        // reader.readAsArrayBuffer(file);
        // const buf = Buffer.from(reader.result) // Convert data into buffer

        // const fileBuffer = await new Buffer( file);

        // await ipfs.add(fileBuffer, (err, ipfsHash) => {
        // console.log(err,ipfsHash);
        // console.log("ipfsHash: ", ipfsHash[0].hash);

        // })

        //ipfsHash:ipfsHash[0].hash

        // 4. 파일 정보
        let response = {
            originalName: file.originalname,
            size: file.size,
            hash: hash
        }

        console.log("result: ", response)
        // res.redirect("/")

        // res.json(filesAdded[0].hash);

        res.status(200).json(response);
        // res.render('index.html')

    });

}