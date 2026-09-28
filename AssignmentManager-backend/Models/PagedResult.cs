namespace AssignmentManager.Models
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }
}

/*
 Note - 01: How does line - 09: 'public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);' works?
    If 'TotalCount' aka the Page Number is 47, and the Page Size is 10, 
    then show 47/10=4.7 and Math.Ceiling of (47/10)=4.7 is 5. So, total number of page will be shown is 5.
 */
