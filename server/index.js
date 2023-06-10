const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose
  .connect(
    "mongodb+srv://vinayrinait:vinay@cluster0.qcgcqfp.mongodb.net/trainbookin?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  reserved: { type: Boolean, default: false },
});

const Seat = mongoose.model("Seat", seatSchema);

app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while retrieving seats" });
  }
});

app.post("/seats/reserve", async (req, res) => {
  const { count } = req.body;

  try {
    const seats = await Seat.find({ reserved: false }).sort("seatNumber");
    const n = seats.length;

    if (n < count) {
      return res.status(400).json({ error: "Not enough available seats" });
    }

    let start = 0;
    let end = count - 1;
    let windowReserved = false;

    while (end < n) {
      let isValidWindow = true;

      for (let i = start; i <= end; i++) {
        if (seats[i].seatNumber + 1 !== seats[i + 1].seatNumber) {
          isValidWindow = false;
          start = i + 1;
          end = start + count - 1;
          break;
        }
      }

      if (isValidWindow) {
        // Reserve the seats within the valid window
        await Seat.updateMany(
          { _id: { $in: seats.slice(start, end + 1).map((seat) => seat._id) } },
          { reserved: true }
        );

        windowReserved = true;
        break;
      }
    }

    if (windowReserved) {
      res.json({ message: "Seats reserved successfully" });
    } else {
      res.status(400).json({ error: "Not enough available seats in one row" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while reserving seats" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
