export interface EventInput {
  title: string;
  description: string;
  date: string;
  price: string | number;
  imageUrl: string;
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
} {
  const errors: string[] = [];
  let parsedDate: Date | undefined;

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
      errors.push("Formato de data inválido. Use DD-MM-YYYY.");
    } else {
      parsedDate = maybeDate;
    }
  }

  // price
  if (data.price === undefined || data.price === null) {
    errors.push("Preço é obrigatório.");
  } else {
    const parsedPrice = parseFloat(data.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      errors.push("Preço deve ser um número válido e positivo.");
    }
  }

  // image
  if (!data.imageUrl || typeof data.imageUrl !== "string") {
    errors.push("URL da imagem é obrigatória e deve ser uma string.");
  }

  return {
    valid: errors.length === 0,
    errors,
    parsedDate,
  };
}
