/* Test to verify the database connection to MongoDB Atlas : We return mongoose instance 
    from db.config.js and check if the connection is established successfully.
    The test checks if the `run` function is defined, calls it, and verifies that the
    instance returned is truthy and that the connection state is 1 (connected).
*/
const { run } = require('../config/db.config'); 


describe('Database connection', () => {
  it("Should connect to MongoDB Atlas", async () => {
    expect(run).toBeDefined();

    const db = await run();
    
    expect(db).toBeTruthy();
    expect(db.connection.readyState).toBe(1); 
    await db.connection.close(); 
  });
});
