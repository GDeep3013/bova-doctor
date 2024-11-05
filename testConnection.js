const mongoose = require('mongoose');

async function main() {
  try {
    let data = await mongoose.connect("mongodb://103.174.10.78:27017/dddd");
    console.log(data);
    return 'MongoDB connected successfully';
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return 'MongoDB connection failed';
  }
}

// Call the main function and handle the result
main()
  .then((message) => console.log(message))
  .catch((error) => console.error(error));
