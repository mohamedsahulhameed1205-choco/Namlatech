require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./db");

async function resetPassword() {
  try {
    const email = "admin@gmail.com";
    const newPassword = "Care@123";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2 AND role = 'admin' RETURNING email",
      [hashedPassword, email]
    );

    if (result.rows.length > 0) {
      console.log("Admin password updated successfully");
    } else {
      console.log("Admin account not found");
    }

  } catch (error) {
    console.log(error);
  } finally {
    await pool.end();
  }
}

resetPassword();