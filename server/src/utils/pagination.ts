export const getPagination = (pageValue: unknown, limitValue: unknown, defaultLimit: number, maxLimit = 50) => {
  const parsedPage = Number(pageValue);
  const parsedLimit = Number(limitValue);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, maxLimit)
    : defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
};
