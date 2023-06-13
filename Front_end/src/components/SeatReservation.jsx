import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";

const SeatReservation = () => {
  const [seats, setSeats] = useState([]);
  const [numSeats, setNumSeats] = useState("");
  const [book, setBook] = useState([]);

  useEffect(() => {
    // Fetch all seats from the backend
    const fetchSeats = async () => {
      try {
        const response = await axios.get(
          "https://kind-teal-fossa-veil.cyclic.app/seat"
        );
        const sortedSeats = response.data.seats.sort(
          (a, b) => a.seatNumber - b.seatNumber
        );
        setSeats(sortedSeats);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSeats();
  }, []);

  const reserveSeats = async () => {
    try {
      const response = await axios.post(
        "https://kind-teal-fossa-veil.cyclic.app/seat/reserve",
        {
          numSeats: parseInt(numSeats),
        }
      );
      setBook(response.data.message);

      // Refresh the seat data after reservation
      const seatResponse = await axios.get(
        "https://kind-teal-fossa-veil.cyclic.app/seat"
      );
      const sortedSeats = seatResponse.data.seats.sort(
        (a, b) => a.seatNumber - b.seatNumber
      );
      setSeats(sortedSeats);
      setNumSeats("");
    } catch (error) {
      console.error(error.response?.data?.error);
    }
  };

  const resetSeats = async () => {
    try {
      await axios.put("https://kind-teal-fossa-veil.cyclic.app/seat/reset");

      // Refresh the seat data after resetting
      const response = await axios.get(
        "https://kind-teal-fossa-veil.cyclic.app/seat"
      );
      const sortedSeats = response.data.seats.sort(
        (a, b) => a.seatNumber - b.seatNumber
      );
      setSeats(sortedSeats);
    } catch (error) {
      console.error(error.response?.data?.error);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      marginBottom="50px"
    >
      <Heading size="xl" marginBottom="2">
        Train Reservation
      </Heading>
      <Stack direction="row" spacing="4" marginBottom="4">
        <Text>Number of Seats:</Text>
        <Input
          type="number"
          value={numSeats}
          onChange={(e) => setNumSeats(e.target.value)}
        />
        <Button colorScheme="blue" onClick={reserveSeats}>
          Reserve Seats
        </Button>
        <Button colorScheme="orange" onClick={resetSeats}>
          Reset Seats
        </Button>
      </Stack>
      <Grid
        templateColumns="repeat(7, 1fr)"
        gap="2"
        marginTop="4"
        justifyItems="center"
      >
        {seats.map((seat) => (
          <Box
            key={seat._id}
            width="40px"
            height="40px"
            bg={seat.isBooked ? "greenyellow" : "yellow"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>{seat.seatNumber}</Text>
          </Box>
        ))}
      </Grid>
      <Stack direction="row" spacing="2" marginTop="4">
        <Text>Booked Seats No:</Text>
        {book.map((el) => (
          <Text key={el}>{el}</Text>
        ))}
      </Stack>
    </Flex>
  );
};

export default SeatReservation;
