export interface EventInput {
  title: string;
  description: string;
  date: string;
  price: string | number;
  imageUrl: string;
  totalTickets: number | string;
}

function parseDateFromDDMMYYYY(input: string): Date | null {
  const parts = input.split("-");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;

  if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
    return null;
  }

  const isoString = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  const parsed = new Date(isoString);
  if (isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function validateEventInput(data: any): {
  valid: boolean;
  errors: string[];
  parsedDate?: Date;
  parsedTotalTickets?: number;
} {
  const errors: string[] = [];
  let parsedDate: Date | undefined;
  let parsedTotalTickets: number | undefined;

  // title
  if (!data.title || typeof data.title !== "string") {
    errors.push("Title is required.");
  }

  // description
  if (!data.description || typeof data.description !== "string") {
    errors.push("Description is required.");
  }

  // date
  if (!data.date || typeof data.date !== "string") {
    errors.push("Date is required in DD-MM-YYYY.");
  } else {
    const maybeDate = parseDateFromDDMMYYYY(data.date);
    if (!maybeDate) {
      errors.push("Invalid date format. Use DD-MM-YYYY.");
    } else {
      parsedDate = maybeDate;
    }
  }

  // price
  if (data.price === undefined || data.price === null) {
    errors.push("Price is required.");
  } else {
    const parsedPrice = parseFloat(data.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      errors.push("Price must be a valid, positive number.");
    }
  }

  // image
  if (!data.imageUrl || typeof data.imageUrl !== "string") {
    errors.push("Image URL is required.");
  }

  // totalTickets
  if (data.totalTickets === undefined || data.totalTickets === null) {
    errors.push("totalTickets is required.");
  } else {
    const parsed = parseInt(data.totalTickets);
    if (isNaN(parsed) || parsed <= 0) {
      errors.push("totalTickets must be integer and positive number.");
    } else {
      parsedTotalTickets = parsed;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    parsedDate,
    parsedTotalTickets,
  };
}
