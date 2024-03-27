// const axios = require('axios');
const fs = require('fs');

function generateMockDoctor(index) {
    const specialties = ["Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Ophthalmology"];
    const locations = ["Pune", "Mumbai", "Delhi", "Bangalore", "Chennai"];
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const gender = Math.random() < 0.5 ? "Male" : "Female";
    const active = Math.random() < 0.9 ? true : false;

    const doctor = {
        name: `Dr.testDoc${index + 1}`,
        gender: gender,
        specialty: specialties[Math.floor(Math.random() * specialties.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        rating: (Math.random() * (5 - 3) + 3).toFixed(1),
        active: active,
        availability: {}
    };

    daysOfWeek.forEach(day => {
        const numSlots = Math.floor(Math.random() * 3) + 1;
        const timeSlots = [];
        for (let i = 0; i < numSlots; i++) {
            const startHour = Math.floor(Math.random() * 10) + 8;
            timeSlots.push(`${startHour}:00 - ${startHour + 1}:00`);
        }
        doctor.availability[day] = timeSlots;
    });

    return doctor;
}

function writeDoctorsArrayToFile(doctorsArray, filename) {
    // fs.writeFileSync(filename, JSON.stringify(doctorsArray, null, 2));
    fs.writeFileSync(filename, doctorsArray);
}

function generateESBulkReqBody(doctorsArray) {
    let bulkRequestBody = "";
    doctorsArray.forEach(doctor => {
        bulkRequestBody += JSON.stringify({ "index" : { "_index" : "doctors"} });
        bulkRequestBody += '\n'
        bulkRequestBody += JSON.stringify(doctor);
        bulkRequestBody += '\n'
    });
    return bulkRequestBody;
}

async function indexDoctors() {
    const url = 'http://localhost:9200/doctors/_doc';

    let mockDoctors = [];

    for (let i = 0; i < 200; i++) {
        const doctorData = generateMockDoctor(i);
        try {
            // await axios.post(url, doctorData);
            // console.log(`Indexed doctor ${i + 1}`);
            mockDoctors.push(doctorData);
        } catch (error) {
            console.error(`Error indexing doctor: ${error.message}`);
        }
    }

    const esQuery = generateESBulkReqBody(mockDoctors);
    writeDoctorsArrayToFile(esQuery, 'bulkQuery.json');

    console.log('Indexing complete.');
}

indexDoctors();
