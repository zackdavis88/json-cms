import { Request } from 'express';
import { ITEMS_PER_PAGE } from 'src/config/app';

type PaginationValidation = (
  queryString: Request['query'],
  count: number,
) => {
  page: number;
  totalPages: number;
  itemsPerPage: number;
  pageOffset: number;
  totalItems: number;
};

export const paginationValidation: PaginationValidation = (queryString, count) => {
  let itemsPerPage = ITEMS_PER_PAGE || 10;
  const itemsPerPageInput = Number(queryString.itemsPerPage);
  if (
    itemsPerPageInput &&
    !isNaN(itemsPerPageInput) &&
    Number.isInteger(itemsPerPageInput) &&
    itemsPerPageInput > 0
  ) {
    itemsPerPage = itemsPerPageInput;
  }

  const totalPages = Math.ceil(count / itemsPerPage);

  let page = Number(queryString.page);
  if (isNaN(page) || !Number.isInteger(Number(page)) || page <= 0) {
    page = 1;
  } else if (page > totalPages) {
    // If the page is greater than the limit. set it to the limit.
    page = totalPages ? totalPages : 1;
  }

  const pageOffset = (page - 1) * itemsPerPage;

  return {
    page,
    totalItems: count,
    totalPages,
    itemsPerPage,
    pageOffset,
  };
};

export type PaginationData = ReturnType<typeof paginationValidation>;
