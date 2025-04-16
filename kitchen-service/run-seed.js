const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runSeedFile() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3309,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'obeman123',
      database: process.env.MYSQL_DATABASE || 'restoran',
      multipleStatements: true // Important for running multiple SQL statements
    });

    console.log('Connected to database');

    // Read the seed.sql file
    const seedFilePath = path.join(__dirname, '..', 'order-service', 'seed.sql');
    console.log(`Reading seed file from: ${seedFilePath}`);
    
    try {
      const seedFileContent = await fs.readFile(seedFilePath, 'utf8');
      console.log('Seed file content loaded successfully');
      
      // Execute the SQL statements
      console.log('Executing seed SQL...');
      await connection.query(seedFileContent);
      console.log('Seed SQL executed successfully');
      
      // Verify tables were created
      const [tables] = await connection.execute("SHOW TABLES");
      console.log("Tables in database after seeding:", tables.map(t => Object.values(t)[0]));
      
      await connection.end();
      console.log('Database seed completed successfully');
    } catch (fileErr) {
      console.error('Error reading or executing seed file:', fileErr);
    }
  } catch (error) {
    console.error('Error running seed file:', error);
  }
}

runSeedFile(); 