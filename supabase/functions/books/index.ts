import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Model book
interface Book {
  book_id: number;
  title: string;
  author_id: number;
  price: number;
  publish_date: string;
}

interface Author {
  author_id: number;
  name: string;
  phone: string;
  country: string;
}

interface Country {
  country_id: number;
  title: string;
  code: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Authenticate in header with "Bearer "
  const authHeader = req.headers.get("Authorization") || "";

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);


  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Query parameters
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action === "getBooks") {
    const authorId = url.searchParams.get("author_id");
    const sort = url.searchParams.get("sort") || "asc";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    // Base query
    let query = supabase
      .from<Book>("Books")
      .select("book_id, title, author_id, price, publish_date");

    if (authorId) {
      query = query.eq("author_id", parseInt(authorId, 10));
    }
    query = query.order("publish_date", { ascending: sort === "asc" }).range(offset, offset + limit - 1);

    // Execute query
    const { data: books, error: queryError } = await query;

    if (queryError) {
      return new Response("Error fetching books", { status: 500 });
    }

    return new Response(JSON.stringify(books), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } else if (action === "getBooksWithAuthors") {

    const url = new URL(req.url);
    const year = url.searchParams.get("year");

    const { data: books, error: booksError } = await supabase
      .from("Books")
      .select(`
        book_id,
        title,
        price,
        publish_date,
        Authors (
          author_id,
          name,
          country:country_id (title)
        )
      `)
      .order("price", { ascending: false }); // Sort by price descending

    if (booksError) {
      return new Response("Error fetching books with authors", { status: 500 });
    }

    const filteredBooks = year
      ? books.filter((book) => new Date(book.publish_date).getFullYear() === parseInt(year, 10))
      : books;

    const formattedResponse = filteredBooks.map((book) => ({
      book_id: book.book_id,
      title: book.title,
      price: book.price,
      publish_date: book.publish_date,
      author: {
        author_id: book.Authors.author_id,
        name: book.Authors.name,
        country: book.Authors.country?.title || "Unknown",
      },
    }));

    return new Response(JSON.stringify(formattedResponse), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  return new Response("Action not found", { status: 404 });

});
