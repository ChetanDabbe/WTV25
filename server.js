const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const { userInfo } = require('os');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public2')));
app.use(express.static(path.join(__dirname, 'public/staff_login')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // // useCreateIndex: true
})
.then(() => {
    console.log(`Connected to MongoDB`);
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Define Mongoose schemas and models
// app.post('/submit', async (req, res) => {
//     try {
//         const newData = new StudData({
//             studname: req.body.studname,
//             parentname: req.body.parentname,
//             email: req.body.email,
//             phone: req.body.phone,
//             grade: req.body.grade,
//             year_of_passing: req.body.year_of_passing,
//             pschool: req.body.pschool,
//             referral: req.body.referral
//         });
//         console.log(newData);

//         await newData.save();
//         res.redirect('/');
//     } catch (error) {
//         console.error('Error saving data:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });
const studDataSchema = new mongoose.Schema({
    studname: String,
    parentname: String,
    email: String,
    phone: String,
    grade: String,
    year_of_passing: String,
    pschool: String,
    referral: String
});

const StudData = mongoose.model('StudData', studDataSchema);
app.post('/submit', async (req, res) => {
    try {
        console.log('Received form data:', req.body);

        const newData = new StudData({
            studname: req.body.studname,
            parentname: req.body.parentname,
            email: req.body.email,
            phone: req.body.phone,
            grade: req.body.grade,
            year_of_passing: req.body.year_of_passing,
            pschool: req.body.pschool,
            referral: req.body.referral
        });
        
        console.log('New data object:', newData);

        await newData.save();
        console.log('Data saved successfully');

        res.redirect('/');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Internal Server Error');
    }
});


const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true,

    }
});

const LoginData = mongoose.model('LoginData', loginSchema);

module.exports = LoginData;

app.post('/staff_login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await LoginData.findOne({ username });

        console.log('Staff login object:', user); 

        if (user) {
            console.log('Retrieved password:', user.password); 

            const passwordMatch1 = user.password;

            console.log('Password match:', passwordMatch1); 

            if (passwordMatch1) {
                res.redirect('/admission_data'); 
            } else {
                res.status(401).send('Login unsuccessful: Incorrect password');
            }
        } else {
            res.status(404).send('Login unsuccessful: Login not found');
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send('Internal Server Error');
    }
});
// app.post('/staff_login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         const user = await LoginData.findOne({ username });

//         if (user) {
//             const passwordCheck=await bcrypt.compare(password,user.password);
//             if (passwordCheck) {
//                 // res.send('<h1>Welcome to Login Page</h1>');
//                 res.redirect('/admission_data');
//             } else {
//                 res.send('Login unsuccessful: Incorrect password');
//             }
//         } else {
//             res.status(404).send('Login unsuccessful: Login Details not found');
//         }
//     } catch (error) {
//         console.error("Error logging in:", error);
//         res.status(500).send('Internal Server Error');
//     }
// });



const AdminloginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true,

    }
});

const AdminLoginData = mongoose.model('AdminLoginData', AdminloginSchema);

module.exports = AdminLoginData;



// app.post('/admin', async (req, res) => {
//     const { username, password } = req.body;

//     try {

//         const admin = await AdminLoginData.findOne({ });
//         console.log(admin.username);
//         if (admin.username) {
//             console.log(admin.password);
//             if (admin.password === password) {
//                 res.redirect('/addUser');
//             } else {
//                 res.status(401).send('Login unsuccessful: Incorrect password');
//             }
//         } else {
//             res.status(404).send('Login unsuccessful: Admin not found');
//         }
//     } catch (error) {
//         console.error("Error logging in:", error);
//         res.status(500).send('Internal Server Error');
//     }
// });
app.post('/admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await AdminLoginData.findOne({ username });

        console.log('Admin object:', admin); // Log the retrieved admin object

        if (admin) {
            console.log('Retrieved password:', admin.password); // Log the retrieved hashed password

            const passwordMatch = admin.password;

            console.log('Password match:', passwordMatch); // Log the result of the password comparison

            if (passwordMatch) {
                res.redirect('/addUser'); // Successful login redirect
            } else {
                res.status(401).send('Login unsuccessful: Incorrect password');
            }
        } else {
            res.status(404).send('Login unsuccessful: Admin not found');
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send('Internal Server Error');
    }
});





app.get('/display', async (req, res) => {
    try {
        const data1 = await StudData.find({});
        console.log(data1);
        res.json(data1);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/add', async (req, res) => {
    try {
        
        const hashedPassword = await bcrypt.hash(req.body.pass, 10); // 10 is the saltRounds
        
        const addNewUser = new LoginData({
            username: req.body.user,
            password: hashedPassword, 
        });
        await addNewUser.save();
        // alert("User added successfully");
        res.redirect('/addUser');
        
    }
    catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/export', async (req, res) => {
    try {
        const data2 = await StudData.find();
        
        const jsonData = data2.map(item => ({
            studname: toTitleCase(item.studname),
            parentname: toTitleCase(item.parentname),
            email: item.email,
            phone: item.phone,
            grade: toTitleCase(item.grade),
            year_of_passing: item.year_of_passing,
            pschool: toTitleCase(item.pschool),
            referral: toTitleCase(item.referral)
        }));
        console.log(jsonData);
        const worksheet = xlsx.utils.json_to_sheet(jsonData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader('Content-Disposition', 'attachment; filename=custom_filename.xlsx');
        res.send(excelBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

function toTitleCase(text) {
    if (!text) return ''; 
    return text.replace(/\b\w/g, char => char.toUpperCase());
}


app.get('/admission_data', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Table_data/admission_history.html'))
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public/staff_login/login.html'))
});

app.get('/adduser', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public/Add_user/add.html'))
})

app.get('/admin_login', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin_login/admin_login.html'));
});

app.get('/admissions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public2', 'admission.html'));
});

const server = app.listen(port, () => {

    console.log(`\nServer is running on port \n http://localhost:${port}`);
    // console.log("Successfully Started");
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        // console.log('MongoDB connection closed');
        server.close();
    });
});
