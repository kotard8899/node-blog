const convertPagination = function(articles, page) {
  let currentPage = parseInt(page) || 1;
  const perPage = 5;
  const totalPages = Math.ceil(articles.length / perPage)
  if(currentPage > totalPages) currentPage = totalPages;
  const pages = {
    currentPage,
    totalPages,
    hasPre: currentPage > 1,
    hasNext: currentPage < totalPages
  };
  articles = articles.slice((currentPage * perPage - perPage), (currentPage * perPage));
  return {
    articles, 
    pages
  }
}

module.exports = convertPagination;