

const express = require('express'); //for creating the server
const cors = require('cors'); //for cross origin resource sharing

const mongoose = require('mongoose'); //for connecting to the database
const bodyParser = require('body-parser'); //for parsing the body of the request message

const net = require('net'); //for checking if the port is in use

const User = require('./models/users');
const Location = require('./models/locations');
const Hospital = require('./models/hospitals');
const Categories = require('./models/categories');
const Doctors = require('./models/doctors');
const Logs = require('./models/logs');

const app = express(); //creating the server

app.use(cors()); //permission to access the server
app.use(bodyParser.json()); //this is to parse the body of the request message


app.get('/', function(req, res) {
    res.send('Hello World!');
  });

app.listen(3001, function() {
    console.log('App listening on port 3001!');
  });

mongoose.connect('mongodb+srv://baqirnemer:123@db.zuvlwa8.mongodb.net/MediRecord')
.then(() => {
console.log('Connected to database!'); 
})
.catch(() => {
console.log("Failed to connect!");
});


app.post('/api/users', async (req, res) => {
  try {
    const { id, pass, f_name, l_name, location_id, email, phone, dob, blood_type, role_name, image } = req.body;
    if (location_id) {
        const locationExists = await Location.exists({ _id: location_id });
        if (!locationExists) {
            return res.status(400).json({ message: 'Location does not exist' });
        }
    }
    const user = await User.create({ _id: new mongoose.Types.ObjectId(), id, pass, f_name, l_name, location_id, email, phone, dob, blood_type, role_name, image });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users from the database
    res.json(users); // Send the users as a JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});


app.post('/api/hospitals', async (req, res) => {
  try {
    const { location_id, name, phone, image, description } = req.body;
    if (location_id) {
      const locationExists = await Location.exists({ _id: location_id });
      if (!locationExists) {
          return res.status(400).json({ message: 'Location does not exist' });
      }
    }
    const hospital = await Hospital.create({_id: new mongoose.Types.ObjectId(), location_id, name, phone, image, description });
    
    res.status(201).json(hospital);
  } catch (error) {
    console.error('Error creating hospital:', error);
    res.status(500).json({ message: 'Error creating hospital' });
  }
});
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find(); 
    res.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});


app.post('/api/doctors', async (req, res) => {
  try {
    const { user_id, hospital_id } = req.body;
    
    const userExists = await User.exists({ _id: user_id });
    const hospitalExists = await Hospital.exists({ _id: hospital_id });

    if (!userExists) {
        return res.status(400).json({ message: 'User does not exist' });
    }
    if (!hospitalExists) {
      return res.status(400).json({ message: 'Hospital does not exist' });
    } 

    const user = await User.findById(user_id);
    const userRole = user.role_name;

    if (userRole !== 'doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
    }

    // Create the doctor entry
    const doctor = await Doctors.create({ _id: new mongoose.Types.ObjectId(), user_id, hospital_id });
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor' });
  }
});
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctors.find(); 
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});



app.post('/api/categories', async (req, res) => {
  try {
    const { cname } = req.body;
    const category = await Categories.create({ _id: new mongoose.Types.ObjectId(), cname });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Categories.find(); 
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});


app.post('/api/logs', async (req, res) => {
  try {
    const { patient_id, doctor_id, hospital_id, category_id, description } = req.body;

    const patientExists = await User.exists({ _id: patient_id, role_name: 'patient' });
    const doctorExists = await Doctors.exists({ _id: doctor_id });
    const hospitalExists = await Hospital.exists({ _id: hospital_id });
    const categoryExists = await Categories.exists({ _id: category_id });

    if (!patientExists ) {
        return res.status(400).json({ message: 'Patient does not exist or is not a patient' });
    }
    if (!doctorExists) {
      return res.status(400).json({ message: 'Doctor does not exist' });
    }
    if (!hospitalExists) {
      return res.status(400).json({ message: 'Hospital does not exist' });
    }
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category does not exist' });
    }

    const log = await Logs.create({ _id: new mongoose.Types.ObjectId(), patient_id, doctor_id, hospital_id, category_id, description });
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Error creating log' });
  }
});
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Logs.find(); 
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});
