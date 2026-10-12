from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """?page=2&page_size=24 ko'rinishida sahifalash."""

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 48
