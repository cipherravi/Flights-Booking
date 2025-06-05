const { Seat } = require("../../models");

const generateRowLabels = (count) => {
  const labels = [];
  let i = 0;
  while (labels.length < count) {
    let label = "";
    let n = i;
    do {
      label = String.fromCharCode((n % 26) + 65) + label;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    labels.push(label);
    i++;
  }
  return labels;
};

const getSeatType = (number, seatsPerRow) => {
  if (seatsPerRow === 6) {
    if (number === 1 || number === 6) return "window";
    if (number === 3 || number === 4) return "aisle";
    return "middle";
  }
  return "standard";
};

const generateSeatsForAirplane = async (id, capacity) => {
  const totalSeats = capacity;
  const seatsPerRow = 6;
  const totalRows = Math.ceil(totalSeats / seatsPerRow);
  const rowLabels = generateRowLabels(totalRows);

  // Initial class distribution by percentage
  let firstClassRows = Math.floor(totalRows * 0.05);
  let businessClassRows = Math.floor(totalRows * 0.1);
  let premiumClassRows = Math.floor(totalRows * 0.15);

  // Enforce at least one row for each if possible
  if (totalRows >= 4) {
    if (firstClassRows === 0) firstClassRows = 1;
    if (businessClassRows === 0) businessClassRows = 1;
    if (premiumClassRows === 0) premiumClassRows = 1;
  }

  // Recalculate economy rows to fit total
  const economyClassRows =
    totalRows - (firstClassRows + businessClassRows + premiumClassRows);

  const seatData = [];

  for (let i = 0; i < totalRows; i++) {
    const row = rowLabels[i];
    let seatClass = "economy";

    if (i < firstClassRows) seatClass = "first";
    else if (i < firstClassRows + businessClassRows) seatClass = "business";
    else if (i < firstClassRows + businessClassRows + premiumClassRows)
      seatClass = "premium economy";

    for (let j = 1; j <= seatsPerRow; j++) {
      const seatNumber = `${row}${j}`;
      const seatType = getSeatType(j, seatsPerRow);
      seatData.push({
        row,
        number: j,
        seatNumber,
        seatClass,
        seatType,
        airplaneId: id,
      });

      if (seatData.length >= totalSeats) break;
    }

    if (seatData.length >= totalSeats) break;
  }

  await Seat.bulkCreate(seatData);
};

module.exports = generateSeatsForAirplane;
