export function validateTicketInput(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.eventId || isNaN(Number(data.eventId))) {
    errors.push("eventId is required and must be a number.");
  }

  if (
    !data.quantity ||
    isNaN(Number(data.quantity)) ||
    Number(data.quantity) <= 0
  ) {
    errors.push("Quantity is required and must be greater than 0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
