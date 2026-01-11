const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
var bodyParser = require('body-parser')
const crypto = require('crypto');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken'); 
 
// create application/json parser
app.use(bodyParser.json())
 
// create application/x-www-form-urlencoded parser
// app.post("/log", function(req, res){
//     console.log(req.body)
//     fs.appendFileSync('./logs.log', req.body.msg+"\n");
// })
app.post("/logfm", function(req, res){
    console.log(req.body)
    fs.appendFileSync('./logs.log', req.body.msg+"\n");
})
const port = process.env.PORT || 3011;
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// app.get('/renewal', function(req, res) {
//     res.sendFile(path.join(__dirname, '/renewal.html'));
// });
app.get('/renewalfm', function(req, res) {
    res.sendFile(path.join(__dirname, '/renewal.html'));
});
// app.get('/index', function(req, res) {
//     res.sendFile(path.join(__dirname, '/index.html'));
// });
app.get('/indexfm', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});
// app.get('/karaokepage', function(req, res) {
//     res.sendFile(path.join(__dirname, '/karaokepage.html'));
// });
app.get('/karaokepagefm', function(req, res) {
    res.sendFile(path.join(__dirname, '/karaokepage.html'));
});
// app.get('/confirmpage', function(req, res) {
//     res.sendFile(path.join(__dirname, '/confirmpage.html'));
// });
app.get('/confirmpagefm', function(req, res) {
    res.sendFile(path.join(__dirname, '/confirmpage.html'));
});

// app.get('/Thankyou', function(req, res) {
//     res.sendFile(path.join(__dirname, '/Thankyou.html'));
// });
app.get('/Thankyoufm', function(req, res) {
    res.sendFile(path.join(__dirname, '/Thankyou.html'));
});

app.get('/404', function(req, res) {
    res.sendFile(path.join(__dirname, '/404page.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);


// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        // return res.redirect('/index');
        return res.redirect('/indexfm');
        //   return res.status(403).send('Token is r');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid token');
        }

        req.user = decoded; // Store decoded token payload in request
        next();
    });
};


// app.post("/saveData", verifyToken, (req, res) => {
app.post("/saveDatafm", verifyToken, (req, res) => {
    const db = mysql.createConnection({
        host: '10.119.22.200',
        user: 'root',
        database: 'karaoke'
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            res.status(500).send('Error connecting to database');
            return;
        }

        const { msisdn, packName, renewflag, subunsubFlag, submode, promoName, promoId } = req.body;
        const sql = `INSERT INTO tbl_wap_sub_clicks (msisdn, packName, renewflag, subunsubFlag, submode, promoName, promoId, req_date) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
        const values = [msisdn, packName, renewflag, subunsubFlag, submode, promoName, promoId];
	   console.log('Data to be inserted:', { msisdn, packName, renewflag, subunsubFlag, submode, promoName, promoId });
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).send('Error inserting data');
            } else {
                console.log('Data inserted successfully');
                res.status(200).send('Data inserted successfully');
            }
            
            db.end();
        });
    });
});


const secretKey = crypto.randomBytes(32).toString('hex');
console.log(secretKey);
// Endpoint to generate a token
// app.get('/generate-token', (req, res) => {
app.get('/generate-tokenfm', (req, res) => {

    // Define payload (use static data or any data you prefer)
    const payload = {
        role: 'user', // Example payload, you can customize this
        permissions: ['read', 'write']
    };

    // Define token options
    const options = {
        expiresIn: '20m' // Token expiration time set to 20 minute
    };

    // Generate the token
    const token = jwt.sign(payload, secretKey, options);

    res.json({
        message: 'Token generated successfully',
        token: token
    });
});

// Validate Token API
// app.post('/validate-token', (req, res) => {
app.post('/validate-tokenfm', (req, res) => {
    const token = req.body.token;
  
    if (!token) {
      return res.status(403).json({
        message: 'No token provided'
      });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: 'Failed to authenticate token'
        });
      }
  
      // Token is valid
      res.json({
        message: 'Token is valid',
        decoded: decoded
      });
    });
  });


// app.post("/analytic", verifyToken, (req, res) => {
app.post("/analyticfm", verifyToken, (req, res) => {
    const db = mysql.createConnection({
        host: '10.119.22.200',
        user: 'root',
        database: 'karaoke'
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            res.status(500).send('Error connecting to database');
            return;
        }

        console.log('Connected to MySQL database');

        const { msisdn, browserName, userAgent, platform, language, pageName } = req.body;
        const sql = `INSERT INTO tbl_wap_analytics (msisdn, browserName, userAgent, platform, language, pageName, req_date) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW())`;
        const values = [msisdn, browserName, userAgent, platform, language, pageName];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).send('Error inserting data');
            } else {
               // console.log('Data inserted successfully');
                res.status(200).send('Data inserted successfully');
            }
            
            db.end();
        });
    });
});
