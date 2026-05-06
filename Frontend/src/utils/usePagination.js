import { useState } from "react";

export const usePagination = (data, itemsPerPage = 10) => {
    const [page, setPage] = useState(1);
    const maxPage = Math.ceil(data.length / itemsPerPage);
    const currentData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    return { currentData, page, setPage, maxPage };
}