const { Librarian } = require("./models");

(async () => {
  try {
    await Librarian.create({
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123", // will be auto-hashed
      employee_id: "EMP001",
      phone: "9876543210",
      address: "123 Library Street, City",
      role: "librarian"
    });
    console.log("✅ Librarian added successfully!");
  } catch (err) {
    console.error("❌ Error seeding librarian:", err);
  } finally {
    process.exit();
  }
})();
